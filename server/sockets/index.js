const socketIO = require("socket.io");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");

let io;

const authenticateSocket = async (token) => {
  try {
    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  } catch (err) {
    throw err;
  }
};

const setupSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "*",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Socket.IO middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const user = await authenticateSocket(token);
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id} (User: ${socket.user._id})`);

    // Join user's personal room
    socket.join(socket.user._id.toString());

    // Join admin room if user is admin
    if (socket.user.role === 'admin') {
      socket.join('admin-room');
      console.log(`Admin ${socket.user._id} joined admin-room`);
    }

    // Handle duty submissions
    socket.on("duty-submitted", (data) => {
      // Validate and sanitize data
      const sanitizedData = {
        employeeId: socket.user._id,
        dutyId: data.dutyId,
        data: data.formData,
        submittedAt: new Date()
      };

      // Broadcast to admin room
      io.to("admin-room").emit("new-duty", sanitizedData);
    });

    // Handle leave applications
    socket.on("leave-applied", (data) => {
      const sanitizedData = {
        employeeId: socket.user._id,
        leaveId: data.leaveId,
        fromDate: data.fromDate,
        toDate: data.toDate,
        reason: data.reason,
        appliedAt: new Date()
      };

      io.to("admin-room").emit("leave-notification", sanitizedData);
    });

    // Handle status updates (admin only)
    socket.on("status-updated", async (data) => {
      if (socket.user.role !== 'admin') {
        return socket.emit("error", "Unauthorized");
      }

      try {
        const employee = await User.findById(data.employeeId);
        if (!employee) {
          throw new Error('Employee not found');
        }

        const updateData = {
          oldStatus: employee.status,
          newStatus: data.newStatus,
          updatedBy: socket.user._id,
          updatedAt: new Date()
        };

        // Update employee status
        employee.status = data.newStatus;
        await employee.save();

        // Notify employee
        io.to(data.employeeId).emit("status-change", updateData);

        // Notify admin room
        io.to("admin-room").emit("employee-status-updated", {
          ...updateData,
          employeeId: data.employeeId
        });
      } catch (err) {
        socket.emit("error", err.message);
      }
    });

    // Handle department/duty changes
    socket.on("duty-reassigned", async (data) => {
      if (socket.user.role !== 'admin') {
        return socket.emit("error", "Unauthorized");
      }

      try {
        const employee = await User.findById(data.employeeId)
          .populate('department duties');

        if (!employee) {
          throw new Error('Employee not found');
        }

        const updateData = {
          employeeId: data.employeeId,
          oldDepartment: employee.department,
          newDepartment: data.newDepartmentId,
          oldDuties: employee.duties,
          newDuties: data.newDutyIds,
          changedBy: socket.user._id,
          changedAt: new Date()
        };

        // Update employee record
        employee.department = data.newDepartmentId;
        employee.duties = data.newDutyIds;
        await employee.save();

        // Notify employee
        io.to(data.employeeId).emit("duty-reassignment", updateData);

        // Notify admin room
        io.to("admin-room").emit("employee-duty-updated", updateData);
      } catch (err) {
        socket.emit("error", err.message);
      }
    });

    // Handle salary updates
    socket.on("salary-updated", async (data) => {
      if (socket.user.role !== 'admin') {
        return socket.emit("error", "Unauthorized");
      }

      const updateData = {
        employeeId: data.employeeId,
        amount: data.amount,
        month: data.month,
        type: data.type,
        updatedBy: socket.user._id,
        updatedAt: new Date()
      };

      // Notify employee
      io.to(data.employeeId).emit("salary-change", updateData);

      // Notify admin room
      io.to("admin-room").emit("employee-salary-updated", updateData);
    });

    // Handle disconnections
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });

    // Error handling
    socket.on("error", (err) => {
      console.error(`Socket error (${socket.id}):`, err);
    });
  });

  // Attach io instance to app for use in controllers
  io.attachToApp = (app) => {
    app.set('io', io);
  };
};

module.exports = { setupSocket, getIO: () => io };