const Duty = require('../models/Duty');
const TaskLog = require('../models/TaskLog');
const Leave = require('../models/Leave');
const Salary = require('../models/Salary');
const User = require('../models/User');
const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');

// Update profile image
exports.updateProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload an image', 400));
    }

    // Delete old profile image if it's not default
    const user = await User.findById(req.user.id);
    if (user.profile.profileImage && user.profile.profileImage !== 'default.jpg') {
      const oldImagePath = path.join(__dirname, '../public/uploads/users', user.profile.profileImage);
      try {
        await fs.unlink(oldImagePath);
      } catch (err) {
        console.log('Old image not found or already deleted');
      }
    }

    // Update user profile image
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        'profile.profileImage': req.file.filename
      },
      { new: true, runValidators: true }
    ).populate('department', 'name');

    res.status(200).json({
      status: 'success',
      message: 'Profile image updated successfully',
      data: {
        user: updatedUser,
        imageUrl: `/uploads/users/${req.file.filename}`
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete profile image
exports.deleteProfileImage = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Delete current image file if it's not default
    if (user.profile.profileImage && user.profile.profileImage !== 'default.jpg') {
      const imagePath = path.join(__dirname, '../public/uploads/users', user.profile.profileImage);
      try {
        await fs.unlink(imagePath);
      } catch (err) {
        console.log('Image file not found');
      }
    }

    // Reset to default image
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        'profile.profileImage': 'default.jpg'
      },
      { new: true, runValidators: true }
    ).populate('department', 'name');

    res.status(200).json({
      status: 'success',
      message: 'Profile image deleted successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get employee profile with duties
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('department', 'name')
      .populate('duties', 'title description');
      
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
    
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/employee/me — Update own profile (status, etc.)
exports.updateProfile = async (req, res, next) => {
  try {
    const updates = req.body;

    // Prevent password updates from here
    if (updates.password || updates.passwordConfirm) {
      return res.status(400).json({ message: 'Use /update-password route for password changes' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).populate('department', 'name');

    res.status(200).json({
      status: 'success',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};


// Get employee's assigned duties
exports.getDuties = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('duties', 'title description');
      
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user.duties);
    
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit task for a duty
exports.submitTask = async (req, res, next) => {
  try {
    const { dutyId, formData } = req.body;
    
    // Check if duty is assigned to user
    const user = await User.findById(req.user.id);
    if (!user.duties.includes(dutyId)) {
      return next(new AppError('You are not assigned this duty', 403));
    }
    
    // Create task log
    const task = await TaskLog.create({
      employee: req.user.id,
      duty: dutyId,
      data: formData,
      submittedAt: new Date()
    });
    
    // Populate for real-time event
    const populatedTask = await TaskLog.findById(task._id)
      .populate('employee', 'name')
      .populate('duty', 'title');

    // Emit real-time update to admin room
    req.io.to('admin-room').emit('new-duty', populatedTask);

    res.status(201).json({ 
      status: 'success',
      message: 'Task submitted successfully',
      task: populatedTask
    });
    
  } catch (error) {
    next(error);
  }
};

// Apply for leave
exports.applyLeave = async (req, res, next) => {
  try {
    const { reason, fromDate, toDate } = req.body;
    
    // Validate dates
    if (new Date(fromDate) >= new Date(toDate)) {
      return next(new AppError('End date must be after start date', 400));
    }
    
    // Check for overlapping approved leaves
    const overlappingLeave = await Leave.findOne({
      employee: req.user.id,
      status: 'approved',
      $or: [
        { fromDate: { $lte: toDate }, toDate: { $gte: fromDate } }
      ]
    });
    
    if (overlappingLeave) {
      return next(new AppError('You already have approved leave during this period', 400));
    }
    
    const leave = await Leave.create({
      employee: req.user.id,
      reason,
      fromDate,
      toDate,
      status: 'pending',
      appliedAt: new Date()
    });
    
    // Emit notification to admin room
    req.io.to('admin-room').emit('leave-requested', {
      employeeId: req.user.id,
      leaveId: leave._id,
      fromDate,
      toDate,
      reason
    });

    res.status(201).json({ 
      status: 'success',
      message: 'Leave application submitted',
      leave
    });
    
  } catch (error) {
    next(error);
  }
};

// View salary records
exports.viewSalary = async (req, res) => {
  try {
    const salaries = await Salary.find({ employee: req.user.id })
      .sort({ month: -1 });
      
    res.status(200).json(salaries);
    
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getSalary = async (req, res) => {
  try {
    // Log current user info from the token
    console.log('Getting salary for user:', req.user);

    // Check if user is present
    if (!req.user || !req.user.id) {
      console.log('User not found in request object');
      return res.status(401).json({ message: 'Unauthorized access' });
    }

    // Log the query we're going to run
    console.log('Finding salaries for employee ID:', req.user.id);

    const salaries = await Salary.find({ employee: req.user.id }).sort({ month: -1 });

    // Log what we got from database
    console.log('Salaries found:', salaries);

    res.status(200).json(salaries);

  } catch (error) {
    // Log the full error stack
    console.error('Error fetching salaries:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user.id })
      .sort({ appliedAt: -1 });
      
    res.status(200).json(leaves);
    
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Personal leave analytics for employee
exports.getMyLeaveAnalytics = async (req, res, next) => {
  try {
    const { year } = req.query;
    
    const matchStage = { employee: req.user.id };
    if (year) {
      matchStage.$expr = {
        $eq: [{ $year: "$fromDate" }, parseInt(year)]
      };
    }

    const analytics = await Leave.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            status: "$status",
            month: { $month: "$fromDate" }
          },
          count: { $sum: 1 },
          totalDays: {
            $sum: {
              $divide: [
                { $subtract: ["$toDate", "$fromDate"] },
                86400000
              ]
            }
          }
        }
      },
      {
        $project: {
          status: "$_id.status",
          month: "$_id.month",
          count: 1,
          totalDays: 1,
          _id: 0
        }
      },
      { $sort: { month: 1 } }
    ]);

    // Calculate remaining leave days
    const totalApprovedDays = analytics
      .filter(a => a.status === 'approved')
      .reduce((sum, a) => sum + a.totalDays, 0);

    res.status(200).json({
      status: 'success',
      data: {
        analytics,
        remainingDays: Math.max(0, 22 - totalApprovedDays) // Assuming 22 annual leave days
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.downloadSalaryPDF = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email profile');
    const salaries = await Salary.find({ employee: req.user.id }).sort({ month: -1 });

    if (!salaries || salaries.length === 0) {
      return res.status(404).json({ message: 'No salary records found' });
    }

    // Create HTML content for the PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; }
            .header { margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
            .total-row { font-weight: bold; background-color: #f8f8f8; }
          </style>
        </head>
        <body>
          <h1>Salary Report</h1>
          
          <div class="header">
            <p><strong>Employee Name:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Generated On:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Payment Date</th>
                <th>Advance Amount</th>
                <th>Full Payment</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              ${salaries.map(salary => `
                <tr>
                  <td>${salary.month}</td>
                  <td>${new Date(salary.paidOn).toLocaleDateString()}</td>
                  <td>${salary.advanceAmount} PKR</td>
                  <td>${salary.fullPayment} PKR</td>
                  <td>${salary.amount} PKR</td>
                  <td>${salary.status}</td>
                  <td>${salary.type}</td>
                </tr>
              `).join('')}
              <!-- Total row -->
              <tr class="total-row">
                <td colspan="2">Total</td>
                <td>${salaries.reduce((sum, salary) => sum + salary.advanceAmount, 0)} PKR</td>
                <td>${salaries.reduce((sum, salary) => sum + salary.fullPayment, 0)} PKR</td>
                <td>${salaries.reduce((sum, salary) => sum + salary.amount, 0)} PKR</td>
                <td colspan="2"></td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set the HTML content
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      },
      printBackground: true
    });

    await browser.close();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=salary-records.pdf');
    
    // Send the PDF
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating salary PDF:', error);
    res.status(500).json({ message: 'Server error while generating PDF' });
  }
};

// GET /api/departments
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().select('name description');
    res.status(200).json(departments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/duties
exports.getAllDuties = async (req, res) => {
  try {
    const duties = await Duty.find().select('title description');
    res.status(200).json(duties);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};