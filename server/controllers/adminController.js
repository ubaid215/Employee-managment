const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');
const Duty = require('../models/Duty');
const History = require('../models/History');
const TaskLog = require('../models/TaskLog');
const Leave = require('../models/Leave'); 
const Salary = require('../models/Salary');
const AppError = require('../utils/appError');


// Assign department and duties to employee
exports.assignDepartmentAndDuties = async (req, res, next) => {
  try {
    const { userId, departmentId, dutyIds, reason } = req.body;

    // Validate input
    if (!userId || !departmentId || !Array.isArray(dutyIds)) {
      return next(new AppError('Missing required fields: userId, departmentId, or dutyIds array', 400));
    }

    // Validate MongoDB IDs
    if (!mongoose.Types.ObjectId.isValid(userId) || 
        !mongoose.Types.ObjectId.isValid(departmentId)) {
      return next(new AppError('Invalid ID format', 400));
    }

    if (dutyIds.some(id => !mongoose.Types.ObjectId.isValid(id))) {
      return next(new AppError('Invalid duty ID format', 400));
    }

    // Fetch user
    const user = await User.findById(userId).select('name email department duties status');
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Fetch department
    const department = await Department.findById(departmentId).select('name duties');
    if (!department) {
      return next(new AppError('Department not found', 404));
    }

    // Check duties belong to department
    if (dutyIds.length > 0) {
      const validDuties = await Duty.countDocuments({
        _id: { $in: dutyIds },
        department: departmentId
      });

      if (validDuties !== dutyIds.length) {
        return next(new AppError('One or more duties do not belong to the specified department', 400));
      }
    }

    // Save previous values for history
    const previousDept = user.department;
    const previousDuties = user.duties;

    // Update user
    user.department = departmentId;
    user.duties = dutyIds;
    await user.save();

    // Save history
    const history = await History.create({
      employee: userId,
      fromDepartment: previousDept,
      toDepartment: departmentId,
      fromDuties: previousDuties,
      toDuties: dutyIds,
      changedBy: req.user.id,
      reason: reason || 'Department/duty assignment',
      changeType: previousDept ? 'update' : 'initial'
    });

    // Emit real-time updates
    if (req.io) {
      req.io.to(userId).emit('duty-reassignment', {
        oldDepartment: previousDept,
        newDepartment: departmentId,
        oldDuties: previousDuties,
        newDuties: dutyIds,
        changedAt: history.changedAt,
        changedBy: req.user.name
      });

      req.io.to('admin-room').emit('employee-duty-updated', {
        employeeId: userId,
        employeeName: user.name,
        departmentId,
        departmentName: department.name,
        dutyIds,
        dutyCount: dutyIds.length,
        changedBy: req.user.id,
        changedByName: req.user.name,
        timestamp: new Date()
      });
    }

    // Populate and respond
    const updatedUser = await User.findById(userId)
      .populate('department', 'name')
      .populate('duties', 'title');

    res.status(200).json({
      status: 'success',
      message: 'Department and duties assigned successfully',
      data: {
        user: updatedUser,
        history
      }
    });

  } catch (error) {
    next(error);
  }
};


// GET all departments
exports.getAllDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find()
      .populate('duties', 'title description')
      .sort({ createdAt: -1 });

    // Add employee count for each department
    const departmentsWithStats = await Promise.all(
      departments.map(async (dept) => {
        const employeeCount = await User.countDocuments({ 
          department: dept._id, 
          role: 'employee' 
        });
        
        return {
          ...dept.toObject(),
          employeeCount,
          dutyCount: dept.duties.length
        };
      })
    );

    res.status(200).json({
      status: 'success',
      results: departmentsWithStats.length,
      data: {
        departments: departmentsWithStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET single department by ID
exports.getDepartmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id)
      .populate('duties', 'title description createdAt')
      .populate('createdBy', 'name email');

    if (!department) {
      return next(new AppError('Department not found', 404));
    }

    // Get employees in this department
    const employees = await User.find({ 
      department: id, 
      role: 'employee' 
    }).select('name email status createdAt');

    // Get department statistics
    const stats = {
      totalEmployees: employees.length,
      activeEmployees: employees.filter(emp => emp.status === 'active').length,
      totalDuties: department.duties.length,
      createdAt: department.createdAt
    };

    res.status(200).json({
      status: 'success',
      data: {
        department: {
          ...department.toObject(),
          employees,
          stats
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE department
exports.updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Validate input
    if (!name) {
      return next(new AppError('Department name is required', 400));
    }

    // Check if department exists
    const existingDept = await Department.findById(id);
    if (!existingDept) {
      return next(new AppError('Department not found', 404));
    }

    // Check for duplicate name (excluding current department)
    const duplicateDept = await Department.findOne({ 
      name, 
      _id: { $ne: id } 
    });
    if (duplicateDept) {
      return next(new AppError('Department name already exists', 400));
    }

    // Update department
    const updatedDepartment = await Department.findByIdAndUpdate(
      id,
      { 
        name, 
        description,
        updatedAt: new Date() 
      },
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('duties', 'title description');

    // Emit real-time update
    req.io.to('admin-room').emit('department-updated', {
      departmentId: id,
      name,
      updatedBy: req.user.id
    });

    res.status(200).json({
      status: 'success',
      message: 'Department updated successfully',
      data: {
        department: updatedDepartment
      }
    });
  } catch (error) {
    next(error);
  }
};

// DELETE department
exports.deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { transferDepartmentId } = req.body; // Optional: department to transfer employees to

    // Check if department exists
    const department = await Department.findById(id);
    if (!department) {
      return next(new AppError('Department not found', 404));
    }

    // Check if there are employees in this department
    const employeesInDept = await User.find({ 
      department: id, 
      role: 'employee' 
    });

    if (employeesInDept.length > 0) {
      if (!transferDepartmentId) {
        return next(new AppError(
          `Cannot delete department. ${employeesInDept.length} employees are assigned to this department. Please provide a transferDepartmentId to move them to another department first.`, 
          400
        ));
      }

      // Validate transfer department exists
      const transferDept = await Department.findById(transferDepartmentId);
      if (!transferDept) {
        return next(new AppError('Transfer department not found', 404));
      }

      // Transfer employees to new department
      await User.updateMany(
        { department: id, role: 'employee' },
        { 
          department: transferDepartmentId,
          duties: [] // Clear duties as they might not be compatible
        }
      );

      // Create history records for transferred employees
      const historyRecords = employeesInDept.map(employee => ({
        employee: employee._id,
        fromDepartment: id,
        toDepartment: transferDepartmentId,
        fromDuties: employee.duties,
        toDuties: [],
        changedBy: req.user.id,
        reason: `Department deletion - transferred to ${transferDept.name}`
      }));

      await History.insertMany(historyRecords);

      // Emit real-time updates to affected employees
      employeesInDept.forEach(employee => {
        req.io.to(employee._id.toString()).emit('department-changed', {
          oldDepartment: id,
          newDepartment: transferDepartmentId,
          reason: 'Department was deleted',
          transferredAt: new Date()
        });
      });
    }

    // Delete all duties in this department
    const duties = await Duty.find({ department: id });
    await Duty.deleteMany({ department: id });

    // Delete the department
    await Department.findByIdAndDelete(id);

    // Emit real-time update
    req.io.to('admin-room').emit('department-deleted', {
      departmentId: id,
      departmentName: department.name,
      employeesTransferred: employeesInDept.length,
      transferDepartment: transferDepartmentId ? transferDept.name : null,
      deletedBy: req.user.id
    });

    res.status(200).json({
      status: 'success',
      message: `Department deleted successfully. ${employeesInDept.length} employees transferred to ${transferDepartmentId ? transferDept.name : 'another department'}.`,
      data: {
        deletedDepartment: department.name,
        employeesTransferred: employeesInDept.length,
        dutiesDeleted: duties.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET department analytics
exports.getDepartmentAnalytics = async (req, res, next) => {
  try {
    // Basic department stats
    const totalDepartments = await Department.countDocuments();
    
    // Department with most employees
    const departmentStats = await User.aggregate([
      { $match: { role: 'employee' } },
      { $group: { 
        _id: '$department', 
        employeeCount: { $sum: 1 },
        activeEmployees: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        }
      }},
      { $lookup: {
        from: 'departments',
        localField: '_id',
        foreignField: '_id',
        as: 'department'
      }},
      { $unwind: '$department' },
      { $project: {
        departmentName: '$department.name',
        employeeCount: 1,
        activeEmployees: 1,
        inactiveEmployees: { $subtract: ['$employeeCount', '$activeEmployees'] }
      }},
      { $sort: { employeeCount: -1 } }
    ]);

    // Department with most duties
    const dutyStats = await Department.aggregate([
      { $lookup: {
        from: 'duties',
        localField: '_id',
        foreignField: 'department',
        as: 'duties'
      }},
      { $project: {
        name: 1,
        dutyCount: { $size: '$duties' },
        createdAt: 1
      }},
      { $sort: { dutyCount: -1 } }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalDepartments,
        departmentEmployeeStats: departmentStats,
        departmentDutyStats: dutyStats,
        summary: {
          mostPopularDepartment: departmentStats[0] || null,
          departmentWithMostDuties: dutyStats[0] || null
        }
      }
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
    const { employee, amount, type, month, note, advanceAmount, fullPayment, status } = req.body;
    console.log('Request body:', req.body);

    // Check for existing salary record for this employee and month
    const existingSalary = await Salary.findOne({ 
      employee: employee,  // Changed from employeeId to employee
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
      employee: employee,  // Changed from employeeId to employee
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
    console.error('Salary creation error:', error);  // Add this for better debugging
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
    console.error('Get salaries error:', error);
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
    // Destructure and validate input format
    let { name, description } = req.body;

    // Handle case where name might be nested in an object
    if (name && typeof name === 'object') {
      if (name.name) {
        // Extract name if it was sent as {name: {name: "Dept", description: "Desc"}}
        name = name.name;
      } else {
        return next(new AppError('Invalid department name format', 400));
      }
    }

    // Validate required fields
    if (!name || typeof name !== 'string') {
      return next(new AppError('Department name is required and must be a string', 400));
    }

    // Trim and validate length
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      return next(new AppError('Department name cannot be empty', 400));
    }
    if (trimmedName.length > 50) {
      return next(new AppError('Department name cannot exceed 50 characters', 400));
    }

    // Check for duplicate department (case insensitive)
    const existingDept = await Department.findOne({ 
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') } 
    });
    if (existingDept) {
      return next(new AppError('Department already exists', 400));
    }

    // Process description
    let processedDescription = '';
    if (description) {
      if (typeof description === 'object' && description.description) {
        // Handle nested description if present
        processedDescription = description.description;
      } else if (typeof description === 'string') {
        processedDescription = description;
      }
      
      // Trim and validate description length
      processedDescription = processedDescription.trim();
      if (processedDescription.length > 500) {
        return next(new AppError('Description cannot exceed 500 characters', 400));
      }
    }

    // Create new department
    const department = await Department.create({ 
      name: trimmedName,
      description: processedDescription
    });

    // Emit real-time update
    if (req.io) {
      req.io.to('admin-room').emit('department-created', {
        departmentId: department._id,
        name: department.name,
        description: department.description,
        createdBy: req.user?.id || 'system'
      });
    }

    res.status(201).json({
      status: 'success',
      message: 'Department created successfully',
      data: {
        department
      }
    });

  } catch (error) {
    console.error('Department creation error:', error);
    
    // Handle specific mongoose errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return next(new AppError(`Validation failed: ${messages.join(', ')}`, 400));
    }
    
    // Handle duplicate key error (fallback)
    if (error.code === 11000) {
      return next(new AppError('Department name must be unique', 400));
    }
    
    next(new AppError('An unexpected error occurred while creating department', 500));
  }
};


exports.createDuty = async (req, res, next) => {
  try {
    console.log('🔧 [createDuty] Request body:', req.body);

    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      console.warn('⚠️ [createDuty] Empty request body');
      return next(new AppError('Request body cannot be empty', 400));
    }

    // Extract fields with proper defaults
    const { 
      title, 
      description = '', 
      department, 
      formSchema = { fields: [] }, 
      priority = 'medium',
      deadline,
      estimatedTime,
      tags = []
    } = req.body;

    console.log('📌 [createDuty] Extracted Fields:', { 
      title, 
      description, 
      department, 
      formSchema: formSchema ? 'exists' : 'missing',
      priority,
      deadline,
      estimatedTime
    });

    // Validate required fields
    if (!title) {
      console.warn('⚠️ [createDuty] Missing title');
      return next(new AppError('Title is required', 400));
    }

    if (!department) {
      console.warn('⚠️ [createDuty] Missing department ID');
      return next(new AppError('Department ID is required', 400));
    }

    // Validate department ID format
    if (!mongoose.Types.ObjectId.isValid(department)) {
      return next(new AppError('Invalid department ID format', 400));
    }

    // Check department exists
    const deptExists = await Department.findById(department);
    console.log('🔍 [createDuty] Department found:', deptExists ? deptExists.name : 'Not Found');

    if (!deptExists) {
      return next(new AppError('Department not found', 404));
    }

    // Validate deadline if provided
    if (deadline && new Date(deadline) < new Date()) {
      return next(new AppError('Deadline must be in the future', 400));
    }

    // Validate form schema structure
    if (formSchema) {
      if (!Array.isArray(formSchema.fields)) {
        return next(new AppError('Form schema fields must be an array', 400));
      }

      // Validate each field in the form schema
      for (const field of formSchema.fields) {
        if (!field.name || !field.type) {
          return next(new AppError('Each form field must have a name and type', 400));
        }

        // Validate options for select/radio/checkbox
        if (['select', 'radio', 'checkbox'].includes(field.type) && 
            (!field.options || field.options.length === 0)) {
          return next(new AppError(
            `Field "${field.name}" of type "${field.type}" must have options`, 
            400
          ));
        }
      }
    }

    // Create the duty with all fields
    const duty = await Duty.create({
      title,
      description,
      department,
      formSchema: {
        title: formSchema.title || `${title} Submission Form`,
        description: formSchema.description || `Please complete the form for ${title}`,
        fields: formSchema.fields || [],
        submitButtonText: formSchema.submitButtonText || 'Submit',
        allowMultipleSubmissions: formSchema.allowMultipleSubmissions !== false,
        submissionLimit: formSchema.submissionLimit || null
      },
      priority,
      deadline,
      estimatedTime,
      tags,
      createdBy: req.user.id
    });

    console.log('✅ [createDuty] Duty created with ID:', duty._id);

    // Add duty to department
    await Department.findByIdAndUpdate(department, {
      $push: { duties: duty._id }
    }, { new: true });

    console.log('📁 [createDuty] Duty pushed to department');

    res.status(201).json({
      status: 'success',
      data: {
        duty
      }
    });

  } catch (error) {
    // Handle duplicate key error (unique title per department)
    if (error.code === 11000) {
      const message = `A duty with this title already exists in the selected department`;
      console.error('❌ [createDuty] Duplicate duty:', message);
      return next(new AppError(message, 400));
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      console.error('❌ [createDuty] Validation Error:', messages);
      return next(new AppError(`Validation failed: ${messages.join(', ')}`, 400));
    }

    console.error('❌ [createDuty] Unexpected Error:', error);
    next(error);
  }
};

exports.getDutyFormSchema = async (req, res, next) => {
  try {
    const duty = await Duty.findById(req.params.id)
      .select('title formSchema');
    
    if (!duty) {
      return next(new AppError('Duty not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        formSchema: duty.formSchema
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.validateFormSubmission = async (req, res, next) => {
  try {
    const duty = await Duty.findById(req.params.id);
    
    if (!duty) {
      return next(new AppError('Duty not found', 404));
    }

    const validationResult = duty.validateSubmission(req.body);
    
    res.status(200).json({
      status: 'success',
      data: validationResult
    });
  } catch (error) {
    next(error);
  }
};


// GET all duties with filtering options
exports.getAllDuties = async (req, res, next) => {
  try {
    const { department, search, priority } = req.query;
    const filter = {};
    
    if (department) filter.department = department;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const duties = await Duty.find(filter)
      .populate('department', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    // Count employees assigned to each duty
    const dutiesWithStats = await Promise.all(
      duties.map(async (duty) => {
        const employeeCount = await User.countDocuments({ 
          duties: duty._id,
          role: 'employee'
        });
        
        return {
          ...duty.toObject(),
          employeeCount
        };
      })
    );

    res.status(200).json({
      status: 'success',
      results: dutiesWithStats.length,
      data: {
        duties: dutiesWithStats
      }
    });
  } catch (error) {
    next(error);
  }
};