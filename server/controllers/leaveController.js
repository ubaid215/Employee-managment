const Leave = require('../models/Leave');
const User = require('../models/User');

// Submit leave request
exports.submitLeave = async (req, res) => {
  try {
    const { reason, fromDate, toDate } = req.body;
    
    const leave = await Leave.create({
      employee: req.user.id,
      reason,
      fromDate,
      toDate,
      status: 'pending',
      appliedAt: new Date()
    });
    
    // Emit notification to admin
    req.io.emit('leave-requested', {
      employeeId: req.user.id,
      leaveId: leave._id
    });
    
    res.status(201).json({ 
      message: 'Leave request submitted',
      leave
    });
    
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get leave records
exports.getLeaves = async (req, res) => {
  try {
    let filter = {};
    
    // For employees, only show their own leaves
    if (req.user.role === 'employee') {
      filter.employee = req.user.id;
    }
    // For admins, can filter by employeeId if provided
    else if (req.query.employeeId) {
      filter.employee = req.query.employeeId;
    }
    
    // Additional filters
    if (req.query.status) filter.status = req.query.status;
    if (req.query.month) {
      const [month, year] = req.query.month.split(' ');
      const startDate = new Date(`${month} 1, ${year}`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      
      filter.$or = [
        { fromDate: { $gte: startDate, $lt: endDate } },
        { toDate: { $gte: startDate, $lt: endDate } },
        { $and: [
          { fromDate: { $lt: startDate } },
          { toDate: { $gte: endDate } }
        ]}
      ];
    }
    
    const leaves = await Leave.find(filter)
      .populate('employee', 'name')
      .sort({ fromDate: -1 });
      
    res.status(200).json(leaves);
    
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve/reject leave (admin only)
exports.approveLeave = async (req, res) => {
  try {
    const { leaveId, status, rejectionReason } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const leave = await Leave.findByIdAndUpdate(
      leaveId,
      { 
        status,
        decisionAt: new Date(),
        decidedBy: req.user.id,
        ...(status === 'rejected' && { rejectionReason })
      },
      { new: true }
    ).populate('employee', 'name');
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }
    
    // If approved, update user status if currently on leave
    if (status === 'approved') {
      const today = new Date();
      if (new Date(leave.fromDate) <= today && new Date(leave.toDate) >= today) {
        await User.findByIdAndUpdate(leave.employee, {
          status: 'on_leave'
        });
        
        // Schedule status reversion when leave ends
        const leaveEnd = new Date(leave.toDate);
        leaveEnd.setDate(leaveEnd.getDate() + 1); // Next day
        
        setTimeout(async () => {
          await User.findByIdAndUpdate(leave.employee, {
            status: 'active'
          });
        }, leaveEnd - new Date());
      }
    }
    
    // Emit notification to employee
    req.io.to(`user-${leave.employee._id}`).emit('leave-updated', leave);
    
    res.status(200).json({ 
      message: `Leave ${status}`,
      leave
    });
    
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};