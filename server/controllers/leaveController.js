const Salary = require('../models/Salary');
const User = require('../models/User');
const PDFDocument = require('pdfkit');

// Add salary record (admin only)
exports.addSalary = async (req, res) => {
  try {
    const { employeeId, amount, type, month, note } = req.body;
    
    // Validate month format (e.g. "July 2023")
    if (!/^(January|February|March|April|May|June|July|August|September|October|November|December)\s\d{4}$/.test(month)) {
      return res.status(400).json({ 
        message: 'Month must be in format "Month YYYY"' 
      });
    }
    
    // Check for duplicate salary for same month
    const existingSalary = await Salary.findOne({ 
      employee: employeeId, 
      month 
    });
    
    if (existingSalary) {
      return res.status(400).json({ 
        message: 'Salary already recorded for this month' 
      });
    }
    
    const salary = await Salary.create({
      employee: employeeId,
      amount,
      type,
      month,
      note,
      paidOn: new Date()
    });
    
    // Emit notification to employee
    req.io.to(`user-${employeeId}`).emit('salary-added', salary);
    
    res.status(201).json({ 
      message: 'Salary record added',
      salary
    });
    
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get salary records for employee
exports.getSalaryRecords = async (req, res) => {
  try {
    const salaries = await Salary.find({ employee: req.user.id })
      .sort({ month: -1 });
      
    res.status(200).json(salaries);
    
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Download salary slip as PDF
exports.downloadSalaryPDF = async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id)
      .populate('employee', 'name profile.cnic');
      
    if (!salary) {
      return res.status(404).json({ message: 'Salary record not found' });
    }
    
    // Verify employee owns this record (unless admin)
    if (salary.employee._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Not authorized to access this record' 
      });
    }
    
    // Create PDF
    const doc = new PDFDocument();
    const filename = `salary-${salary.month}-${salary.employee.name}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    doc.pipe(res);
    
    // PDF content
    doc.fontSize(20).text('Salary Slip', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(14).text(`Employee: ${salary.employee.name}`);
    doc.text(`CNIC: ${salary.employee.profile.cnic}`);
    doc.text(`Month: ${salary.month}`);
    doc.text(`Amount: ${salary.amount}`);
    doc.text(`Type: ${salary.type}`);
    doc.text(`Paid On: ${salary.paidOn.toDateString()}`);
    
    if (salary.note) {
      doc.moveDown();
      doc.text(`Note: ${salary.note}`);
    }
    
    doc.end();
    
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};