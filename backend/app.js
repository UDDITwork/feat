require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

// Initialize app
const app = express();

// 🎯 Create HTTP server for Socket.io
const server = http.createServer(app);

// 🎯 Environment configuration
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 5000;

// 🎯 Dynamic Frontend URL
const getFrontendUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.FRONTEND_URL_PROD || process.env.FRONTEND_URL || 'http://localhost:3000';
  }
  return process.env.FRONTEND_URL_LOCAL || process.env.FRONTEND_URL || 'http://localhost:3000';
};

const FRONTEND_URL = getFrontendUrl();

// 🎯 Define allowed origins
const getAllowedOrigins = () => {
  const origins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173', // Vite default port
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5173',
    'https://localhost:3000',
    'https://localhost:3001',
    'https://localhost:5173'
  ];
  
  // Add production frontend URL
  if (process.env.NODE_ENV === 'production') {
    const prodUrl = process.env.FRONTEND_URL_PROD || process.env.FRONTEND_URL;
    if (prodUrl && !prodUrl.includes('localhost')) {
      origins.push(prodUrl);
    }
  }
  
  // Add any additional origins from environment variables
  if (process.env.ADDITIONAL_ALLOWED_ORIGINS) {
    const additionalOrigins = process.env.ADDITIONAL_ALLOWED_ORIGINS.split(',');
    origins.push(...additionalOrigins.map(url => url.trim()));
  }
  
  return origins;
};

console.log(`
🚀 ===============================
   IP INDIA PATENT SERVER CONFIG
===============================
🌍 Environment: ${NODE_ENV}
📡 Port: ${PORT}
🌐 Frontend URL: ${FRONTEND_URL}
🔗 CORS Origins: ${getAllowedOrigins().length} configured
===============================`);

// 🎯 Setup Socket.IO with enhanced CORS configuration
const io = socketIo(server, {
  cors: {
    origin: getAllowedOrigins(),
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  }
});

// 🎯 Socket.io setup for real-time notifications
const connectedAdmins = new Map();
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id} | Origin: ${socket.handshake.headers.origin}`);

  // Admin room joining
  socket.on('admin-join', (adminId) => {
    console.log(`🔧 Admin ${adminId} joined room`);
    socket.join('admin-room');
    connectedAdmins.set(adminId, socket.id);
    
    socket.emit('admin-joined', {
      success: true,
      message: 'Connected to admin notifications',
      adminId,
      timestamp: new Date().toISOString()
    });
  });

  // User room joining
  socket.on('user-join', (userId) => {
    console.log(`👤 User ${userId} joined room`);
    socket.join(`user-${userId}`);
    connectedUsers.set(userId, socket.id);
    
    socket.emit('user-joined', {
      success: true,
      message: 'Connected to form notifications',
      userId,
      timestamp: new Date().toISOString()
    });
  });

  // Enhanced ping/pong handling
  socket.on('ping', (data) => {
    socket.emit('pong', {
      timestamp: new Date().toISOString(),
      latency: data?.timestamp ? Date.now() - data.timestamp : 0,
      socketId: socket.id
    });
  });

  // Connection error handling
  socket.on('error', (error) => {
    console.error(`❌ Socket error for ${socket.id}:`, error);
  });

  // Enhanced disconnect handling
  socket.on('disconnect', (reason) => {
    console.log(`🔌 Socket disconnected: ${socket.id} | Reason: ${reason}`);
    
    // Clean up admin connections
    for (const [adminId, socketId] of connectedAdmins.entries()) {
      if (socketId === socket.id) {
        connectedAdmins.delete(adminId);
        console.log(`🔧 Admin ${adminId} disconnected`);
        break;
      }
    }
    
    // Clean up user connections
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`👤 User ${userId} disconnected`);
        break;
      }
    }
  });
});

// 🎯 Global notification functions
global.io = io;

global.emitToAdmin = (event, data) => {
  try {
    if (io && connectedAdmins.size > 0) {
      io.to('admin-room').emit(event, {
        success: true,
        message: `Admin notification: ${event}`,
        data: data,
        timestamp: new Date().toISOString()
      });
      console.log(`📤 Emitted ${event} to ${connectedAdmins.size} connected admins`);
    }
  } catch (error) {
    console.error('❌ Error emitting to admin:', error);
  }
};

global.emitToUser = (userId, event, data) => {
  try {
    if (io && connectedUsers.has(userId)) {
      io.to(`user-${userId}`).emit(event, {
        success: true,
        message: `Form update: ${event}`,
        data: data,
        timestamp: new Date().toISOString()
      });
      console.log(`📤 Emitted ${event} to user ${userId}`);
    }
  } catch (error) {
    console.error('❌ Error emitting to user:', error);
  }
};

console.log(`
✅ ===============================
   SOCKET.IO CONFIGURATION
===============================
🔗 Transport: WebSocket + Polling
🛡️ CORS Origins: ${getAllowedOrigins().length} configured
⚡ Real-time Features: ACTIVE
🔄 State Recovery: ENABLED
===============================`);

// 🎯 Enhanced security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.set('trust proxy', 1);

// 🎯 Enhanced rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 1000 : 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP',
    retryAfter: '15 minutes'
  }
});

app.use('/api/', limiter);

// Special rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    error: 'Too many authentication attempts',
    retryAfter: '15 minutes'
  }
});

app.use('/api/admin/login', authLimiter);
app.use('/api/auth/login', authLimiter);

// Request logging middleware
app.use((req, res, next) => {
  const logColor = '\x1b[36m';
  const resetColor = '\x1b[0m';
  const timestamp = new Date().toISOString();
  
  console.log(`${logColor}➡️  [${timestamp}] ${req.method} ${req.originalUrl} | Auth: ${req.headers.authorization ? 'YES' : 'NO'} | Origin: ${req.headers.origin || 'N/A'} | IP: ${req.ip}${resetColor}`);
  next();
});

// Enhanced CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Log CORS preflight requests
app.options('*', (req, res, next) => {
  const logColor = '\x1b[35m';
  const resetColor = '\x1b[0m';
  console.log(`${logColor}🛫 [CORS-PREFLIGHT] ${req.method} ${req.originalUrl} | Origin: ${req.headers.origin || 'N/A'}${resetColor}`);
  next();
}, cors(corsOptions));

// Parse JSON body requests
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create public directory for uploads
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log(`📁 Created public directory: ${publicDir}`);
}
app.use('/public', express.static(publicDir));

// Connect to database
try {
  connectDB();
  console.log('📦 Database connection initiated');
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
}

// Initialize admin user if it doesn't exist
const initializeAdmin = async (retries = 3) => {
  try {
    const mongoose = require('mongoose');
    
    // Wait for database connection
    if (mongoose.connection.readyState !== 1) {
      console.log('⏳ Waiting for database connection...');
      setTimeout(() => initializeAdmin(retries), 2000);
      return;
    }
    
    const Admin = require('./src/models/Admin');
    const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    
    if (!existingAdmin) {
      const admin = new Admin({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        name: 'SITABIENCEIP Admin',
        role: 'admin',
        isActive: true
      });
      
      await admin.save();
      console.log('✅ Admin user created successfully');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error initializing admin user:', error.message);
    if (retries > 0) {
      console.log(`🔄 Retrying admin initialization... (${retries} attempts left)`);
      setTimeout(() => initializeAdmin(retries - 1), 2000);
    } else {
      console.log('⚠️  Admin initialization failed after all retries. You can create admin manually later.');
    }
  }
};

// Start admin initialization after a short delay
setTimeout(() => {
  initializeAdmin();
}, 3000);

// 🎯 Enhanced health check endpoint
app.get('/api/health', (req, res) => {
  const healthData = {
    status: 'ok',
    message: 'IP India Patent Auto-Fill System is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    configuration: {
      frontendUrl: FRONTEND_URL,
      corsOrigins: getAllowedOrigins().length,
      port: PORT
    },
    services: {
      database: require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected',
      api: 'operational',
      cors: 'configured',
      socketio: 'active'
    },
    socketConnections: {
      admins: connectedAdmins.size,
      users: connectedUsers.size,
      total: connectedAdmins.size + connectedUsers.size
    },
    memoryUsage: process.memoryUsage()
  };
  
  res.status(200).json(healthData);
});

// 🎯 Configuration debug endpoint (development only)
if (NODE_ENV === 'development') {
  app.get('/api/debug/config', (req, res) => {
    res.status(200).json({
      environment: NODE_ENV,
      frontendUrl: FRONTEND_URL,
      allowedOrigins: getAllowedOrigins(),
      environmentVariables: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        FRONTEND_URL_PROD: process.env.FRONTEND_URL_PROD,
        FRONTEND_URL: process.env.FRONTEND_URL,
        FRONTEND_URL_LOCAL: process.env.FRONTEND_URL_LOCAL,
        ADDITIONAL_ALLOWED_ORIGINS: process.env.ADDITIONAL_ALLOWED_ORIGINS
      }
    });
  });
}

// Mount API routes
app.use('/api/email', require('./src/routes/emailRoutes'));
app.use('/api/form', require('./src/routes/formRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/upload', require('./src/routes/uploadRoutes'));

// Serve React static assets from multiple possible paths
const possiblePaths = [
  path.join(__dirname, 'public'),
  path.join(__dirname, '..', 'frontend', 'build'),
  path.join(__dirname, 'build'),
  path.join(__dirname, 'dist'),
];

let frontendBuildPath = null;
let indexPath = null;

// Find the correct frontend build path
for (const buildPath of possiblePaths) {
  console.log(`🔍 Checking frontend build path: ${buildPath}`);
  
  if (fs.existsSync(buildPath)) {
    const testIndexPath = path.join(buildPath, 'index.html');
    
    if (fs.existsSync(testIndexPath)) {
      frontendBuildPath = buildPath;
      indexPath = testIndexPath;
      console.log(`✅ Frontend build found at: ${frontendBuildPath}`);
      break;
    }
  }
}

if (frontendBuildPath && indexPath) {
  console.log('✅ Frontend build directory found');
  console.log('✅ index.html found');
  
  // Serve static files
  app.use(express.static(frontendBuildPath, {
    maxAge: NODE_ENV === 'production' ? '1d' : '0',
    etag: true,
    lastModified: true,
    index: false,
    dotfiles: 'ignore'
  }));
  
  // Handle React Router routes (SPA fallback)
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ 
        error: 'API endpoint not found',
        path: req.path,
        method: req.method,
        availableEndpoints: [
          '/api/health',
          '/api/email',
          '/api/form',
          '/api/admin',
          '/api/auth'
        ]
      });
    }
    
    // Don't serve index.html for static file requests that failed
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map)$/)) {
      console.log(`❌ Static file not found: ${req.path}`);
      return res.status(404).send(`Static file not found: ${req.path}`);
    }
    
    console.log(`📄 Serving index.html for route: ${req.path}`);
    
    // Send the React app
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error(`❌ Error serving index.html for ${req.path}:`, err);
        res.status(500).json({ 
          error: 'Failed to serve frontend',
          path: req.path 
        });
      }
    });
  });
  
} else {
  console.error(`❌ Frontend build not found in any of these locations:`);
  possiblePaths.forEach(p => console.error(`   - ${p}`));
  
  // Fallback for missing build
  app.get('/', (req, res) => {
    res.status(200).json({
      message: 'IP India Patent Auto-Fill System API',
      version: '1.0.0',
      environment: NODE_ENV,
      status: 'operational',
      note: 'Frontend build not found',
      checkedPaths: possiblePaths,
      solution: 'Please run: npm run build and ensure build files are present',
      endpoints: {
        health: '/api/health',
        admin: '/api/admin',
        auth: '/api/auth',
        email: '/api/email',
        form: '/api/form'
      }
    });
  });
  
  // Catch-all for missing frontend
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.status(404).json({
        error: 'Frontend not available',
        path: req.path,
        message: 'Frontend build files not found on server',
        solution: 'Please build and deploy frontend files'
      });
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

module.exports = { app, server, io };
