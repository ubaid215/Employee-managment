const User = require('../models/User');
const Department = require('../models/Department');
const Duty = require('../models/Duty');
const History = require('../models/History');
const TaskLog = require('../models/TaskLog');
const Leave = require('../models/Leave'); 
const Salary = require('../models/Salary');

// Assign department and duties to employee
exports.assignDepartmentAndDuties = async (req, res, next) => {
  try {
    const { userId, departmentId, dutyIds } = req.body;

    // Validate all IDs exist
    const [user, department] = await Promise.all([
      User.findById(userId).select('department duties'),
      Department.findById(departmentId)
    ]);

    if (!user) return next(new AppError('User not found', 404));
    if (!department) return next(new AppError('Department not found', 404));

    // Validate duties
    if (dutyIds && dutyIds.length > 0) {
      const dutiesCount = await Duty.countDocuments({
        _id: { $in: dutyIds },
        department: departmentId
      });
      
      if (dutiesCount !== dutyIds.length) {
        return next(new AppError('Some duties do not belong to the department', 400));
      }
    }

    // Save previous values for history
    const previousDept = user.department;
    const previousDuties = user.duties;

    // Update user
    user.department = departmentId;
    user.duties = dutyIds;
    await user.save();

    // Create history record
    const history = await History.create({
      employee: userId,
      fromDepartment: previousDept,
      toDepartment: departmentId,
      fromDuties: previousDuties,
      toDuties: dutyIds,
      changedBy: req.user.id,
      reason: req.body.reason || 'Department/duty assignment'
    });

    // Emit real-time updates
    req.io.to(userId).emit('duty-reassignment', {
      oldDepartment: previousDept,
      newDepartment: departmentId,
      oldDuties: previousDuties,
      newDuties: dutyIds,
      changedAt: history.changedAt
    });

    req.io.to('admin-room').emit('employee-duty-updated', {
      employeeId: userId,
      departmentId,
      dutyIds,
      changedBy: req.user.id
    });

    res.status(200).json({
      status: 'success',
      message: 'Department and duties assigned successfully',
      user
    });

  } catch (error) {
    next(error);
  }
};

exports.changeStatus = async (req, res, next) => {
  try {
    const { userId, status } = req.body;

    if (!['pending', 'active', 'suspended', 'on_leave'].includes(status)) {
      return next(new AppError('Invalid status', 400));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const oldStatus = user.status;
    user.status = status;
    await user.save();

    // Emit status change event
    req.io.to(userId).emit('status-change', {
      oldStatus,
      newStatus: status,
      updatedAt: new Date()
    });

    req.io.to('admin-room').emit('employee-status-updated', {
      employeeId: userId,
      oldStatus,
      newStatus: status,
      updatedBy: req.user.id
    });

    res.status(200).json({
      status: 'success',
      message: 'Status updated',
      user
    });

  } catch (error) {
    next(error);
  }
};

// Get all employees with their departments and duties
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' })
      .populate('department', 'name')
      .populate('duties', 'title');

    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEmployee = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id)
      .select('-password -passwordConfirm -passwordResetToken -passwordResetExpires') // Exclude sensitive fields
      .populate({
        path: 'department',
        select: 'name duties createdAt',
        populate: {
          path: 'duties',
          select: 'title description'
        }
      })
      .populate({
        path: 'duties',
        select: 'title description formSchema department',
        populate: {
          path: 'department',
          select: 'name'
        }
      })
      .populate({
        path: 'leaveRecords',
        select: 'reason fromDate toDate status appliedAt decisionAt',
        options: { sort: { fromDate: -1 } }
      })
      .populate({
        path: 'salaryRecords',
        select: 'amount type month paidOn status note advanceAmount fullPayment',
        options: { sort: { month: -1 } }
      })
      .populate({
        path: 'history',
        select: 'fromDepartment toDepartment fromDuties toDuties changedAt reason',
        populate: [
          {
            path: 'fromDepartment toDepartment',
            select: 'name'
          },
          {
            path: 'fromDuties toDuties',
            select: 'title'
          },
          {
            path: 'changedBy',
            select: 'name email'
          }
        ],
        options: { sort: { changedAt: -1 } }
      });

    if (!employee) {
      return next(new AppError('Employee not found', 404));
    }

    // Calculate leave statistics
    const leaveStats = await Leave.aggregate([
      { $match: { employee: employee._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalDays: {
            $sum: {
              $divide: [
                { $subtract: ['$toDate', '$fromDate'] },
                86400000 // milliseconds in a day
              ]
            }
          }
        }
      }
    ]);

    // Calculate salary statistics
    const salaryStats = await Salary.aggregate([
      { $match: { employee: employee._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' }
        }
      }
    ]);

    // Format the response
    const response = {
      status: 'success',
      data: {
        employee: {
          ...employee.toObject(),
          stats: {
            leaves: leaveStats,
            salaries: salaryStats
          }
        }
      }
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// View all task submissions
exports.viewEmployeeTasks = async (req, res) => {
  try {
    const { page = 1, limit = 20, department, duty } = req.query;

    const filter = {};
    if (department) filter['employee.department'] = department;
    if (duty) filter.duty = duty;

    const tasks = await TaskLog.find(filter)
      .populate('employee', 'name')
      .populate('duty', 'title')
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await TaskLog.countDocuments(filter);

    res.status(200).json({
      tasks,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.reviewTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { status, feedback } = req.body;

    const task = await TaskLog.findById(taskId);
    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    // Update and lock the task
    task.status = status;
    task.reviewedAt = new Date();
    task.reviewedBy = req.user.id;
    task.allowUpdates = status === 'needs_revision'; // Only allow updates if needs revision
    task.feedback = feedback || '';

    const updatedTask = await task.save();

    // Real-time updates
    req.io.to(task.employee.toString()).emit('task-status-updated', {
      taskId: task._id,
      status,
      allowUpdates: task.allowUpdates,
      feedback: task.feedback
    });

    req.io.to('admin-room').emit('task-reviewed', {
      taskId: task._id,
      status,
      reviewedBy: req.user.id
    });

    res.status(200).json({
      status: 'success',
      message: `Task ${status}`,
      task: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

exports.getEmployeeTaskStats = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    const stats = await TaskLog.getStatsByEmployee(employeeId);

    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

exports.viewDepartmentHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const history = await History.find({
      $or: [
        { fromDepartment: id },
        { toDepartment: id }
      ]
    })
      .populate('employee', 'name')
      .populate('fromDepartment', 'name')
      .populate('toDepartment', 'name')
      .populate('changedBy', 'name')
      .sort({ changedAt: -1 });

    res.status(200).json({
      status: 'success',
      data: history
    });
  } catch (error) {
    next(error);
  }
};

// GET all leaves with filtering
 exports.getAllLeaves = async (req, res, next) => {
  try {
    const { status, month, employeeId } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (month) filter.month = month;
    if (employeeId) filter.employee = employeeId;

    const leaves = await Leave.find(filter)
      .populate('employee', 'name email')
      .populate('decidedBy', 'name')
      .sort({ fromDate: -1 });

    res.status(200).json({
      status: 'success',
      results: leaves.length,
      data: { leaves }
    });
  } catch (error) {
    next(error);
  }
};

// GET single leave by ID
exports.getLeaveById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findById(id)
      .populate('employee', 'name email')
      .populate('decidedBy', 'name');

    if (!leave) {
      return next(new AppError('Leave request not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        leave
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get leave analytics
exports.getLeaveAnalytics = async (req, res, next) => {
  try {
    const analytics = await Leave.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          latest: { $max: "$fromDate" }
        }
      },
      {
        $project: {
          status: "$_id",
          count: 1,
          latest: 1,
          _id: 0
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: { analytics }
    });
  } catch (error) {
    next(error);
  }
};

// Advanced leave analytics for admin
exports.getAdminLeaveAnalytics = async (req, res, next) => {
  try {
    const { year, department } = req.query;
    
    const matchStage = {};
    if (year) {
      matchStage.$expr = {
        $eq: [{ $year: "$fromDate" }, parseInt(year)]
      };
    }
    if (department) {
      matchStage.employee = {
        $in: await User.find({ department }).distinct('_id')
      };
    }

    const analytics = await Leave.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "employee",
          foreignField: "_id",
          as: "employee"
        }
      },
      { $unwind: "$employee" },
      {
        $group: {
          _id: {
            month: { $month: "$fromDate" },
            department: "$employee.department",
            status: "$status"
          },
          count: { $sum: 1 },
          totalDays: {
            $sum: {
              $divide: [
                { $subtract: ["$toDate", "$fromDate"] },
                86400000 // milliseconds to days
              ]
            }
          },
          employees: { $addToSet: "$employee._id" }
        }
      },
      {
        $project: {
          month: "$_id.month",
          department: "$_id.department",
          status: "$_id.status",
          count: 1,
          totalDays: 1,
          uniqueEmployees: { $size: "$employees" },
          _id: 0
        }
      },
      { $sort: { month: 1 } }
    ]);

    res.status(200).json({
      status: 'success',
      data: { analytics }
    });
  } catch (error) {
    next(error);
  }
};

// PATCH approve/reject leave
exports.approveLeave = async (req, res, next) => {
  try {
    const { id } = req.params; // Now getting ID from URL params
    const { status, rejectionReason } = req.body; // Status comes from request body

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return next(new AppError('Invalid status. Must be approved or rejected', 400));
    }

    // Find leave request
    const leave = await Leave.findById(id);
    if (!leave) {
      return next(new AppError('Leave request not found', 404));
    }

    // Check if already processed
    if (leave.status !== 'pending') {
      return next(new AppError('Leave request already processed', 400));
    }

    // Update leave status
    leave.status = status;
    leave.decidedBy = req.user.id;
    leave.decisionAt = new Date();

    if (status === 'rejected' && rejectionReason) {
      leave.rejectionReason = rejectionReason;
    }

    await leave.save();

    // Populate for response
    await leave.populate('employee', 'name email');
    await leave.populate('decidedBy', 'name');

    // If approved, update user status if currently on leave
    if (status === 'approved') {
      const today = new Date();
      if (new Date(leave.fromDate) <= today && new Date(leave.toDate) >= today) {
        await User.findByIdAndUpdate(leave.employee._id, {
          status: 'on_leave'
        });
        
        // Schedule status reversion when leave ends
        const leaveEnd = new Date(leave.toDate);
        leaveEnd.setDate(leaveEnd.getDate() + 1); // Next day
        
        setTimeout(async () => {
          await User.findByIdAndUpdate(leave.employee._id, {
            status: 'active'
          });
        }, leaveEnd - today);
      }
    }

    // Emit real-time update to employee
    req.io.to(leave.employee._id.toString()).emit('leave-status-updated', {
      leaveId: leave._id,
      status,
      decisionAt: leave.decisionAt,
      rejectionReason: leave.rejectionReason || null
    });

    // Emit to admin room
    req.io.to('admin-room').emit('leave-processed', {
      leaveId: leave._id,
      status,
      decidedBy: req.user.id,
      employeeName: leave.employee.name
    });

    res.status(200).json({
      status: 'success',
      message: `Leave request ${status} successfully`,
      data: {
        leave
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.addSalary = async (req, res, next) => {
  try {
    const { employeeId, amount, type, month, note, advanceAmount, fullPayment, status } = req.body;

    // Check for existing salary record for this employee and month
    const existingSalary = await Salary.findOne({ 
      employee: employeeId, 
      month: month 
    });

    if (existingSalary) {
      // Update existing record instead of creating new one
      existingSalary.amount = amount;
      existingSalary.type = type;
      existingSalary.note = note;
      existingSalary.advanceAmount = advanceAmount;
      existingSalary.fullPayment = fullPayment;
      existingSalary.status = status;
      
      const updatedSalary = await existingSalary.save();
      
      return res.status(200).json({
        status: 'success',
        message: 'Salary record updated successfully',
        data: updatedSalary
      });
    }

    // Create new record if none exists
    const newSalary = await Salary.create({
      employee: employeeId,
      amount,
      type,
      month,
      note,
      advanceAmount,
      fullPayment,
      status
    });

    res.status(201).json({
      status: 'success',
      message: 'Salary added successfully',
      data: newSalary
    });

  } catch (error) {
    next(error);
  }
};

// Get all salaries with filtering options
exports.getAllSalaries = async (req, res, next) => {
  try {
    const { employee, month, status } = req.query;
    const filter = {};
    
    if (employee) filter.employee = employee;
    if (month) filter.month = month;
    if (status) filter.status = status;

    const salaries = await Salary.find(filter)
      .populate('employee', 'name email')
      .sort({ month: -1 });

    res.status(200).json({
      status: 'success',
      results: salaries.length,
      data: { salaries }
    });
  } catch (error) {
    next(error);
  }
};

// Update existing salary record
exports.updateSalary = async (req, res, next) => {
  try {
    const { amount, type, status, note } = req.body;
    
    const salary = await Salary.findByIdAndUpdate(
      req.params.id,
      { amount, type, status, note },
      { new: true, runValidators: true }
    ).populate('employee', 'name');

    if (!salary) {
      return next(new AppError('Salary record not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { salary }
    });
  } catch (error) {
    next(error);
  }
};


exports.createDepartment = async (req, res, next) => {
  try {
    const { name } = req.body;

    // Validate input
    if (!name) {
      return next(new AppError('Department name is required', 400));
    }

    // Check for duplicate department
    const existingDept = await Department.findOne({ name });
    if (existingDept) {
      return next(new AppError('Department already exists', 400));
    }

    // Create new department
    const department = await Department.create({ name });

    res.status(201).json({
      status: 'success',
      data: {
        department
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.createDuty = async (req, res, next) => {
  try {
    // Add validation for empty body
    if (!req.body || Object.keys(req.body).length === 0) {
      return next(new AppError('Request body cannot be empty', 400));
    }

    const { title, description, department, formSchema } = req.body;

    // More detailed validation
    if (!title) {
      return next(new AppError('Title is required', 400));
    }

    if (!department) {
      return next(new AppError('Department ID is required', 400));
    }

    const deptExists = await Department.findById(department);
    if (!deptExists) {
      return next(new AppError('Department not found', 404));
    }

    // Create duty with the authenticated user as creator
    const duty = await Duty.create({
      title,
      description: description || '', // Default empty string if not provided
      department,
      formSchema: formSchema || { fields: [] }, // Default empty schema
      createdBy: req.user.id // Add the authenticated user's ID
    });

    await Department.findByIdAndUpdate(department, {
      $push: { duties: duty._id }
    });

    res.status(201).json({
      status: 'success',
      data: {
        duty
      }
    });

  } catch (error) {
    // Improved error handling
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return next(new AppError(`Validation failed: ${messages.join(', ')}`, 400));
    }
    
    console.error('Error in createDuty:', error);
    next(error);
  }
};