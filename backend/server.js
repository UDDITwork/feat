require('dotenv').config();
const http = require('http');
const path = require('path');

// Environment variables
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = Number(process.env.PORT) || 5000;

// Dynamic frontend URL based on environment
const getFrontendUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.FRONTEND_URL_PROD || process.env.FRONTEND_URL || 'http://localhost:3000';
  }
  return process.env.FRONTEND_URL_LOCAL || process.env.FRONTEND_URL || 'http://localhost:3000';
};

const FRONTEND_URL = getFrontendUrl();

console.log(`
🚀 ===============================
   IP INDIA PATENT SERVER INIT
===============================
🌍 Environment: ${NODE_ENV}
📡 Port: ${PORT}
🌐 Frontend URL: ${FRONTEND_URL}
🔥 Starting server components...
===============================`);

// Define server variable in the global scope
let httpServer;

try {
  // Load app module
  console.log('Loading app module...');
  const { app, server, io } = require('./app');
  console.log('✅ App module loaded successfully');

  // Use the server from app.js
  httpServer = server;

  console.log(`
✅ ===============================
   SERVER CONFIGURATION
===============================
🔗 HTTP Server: Ready
⚡ Express App: Loaded
🛡️ Middleware: Configured
🔄 Database: Connecting...
===============================`);

  // 🎯 Enhanced server startup
  const startServer = () => {
    return new Promise((resolve, reject) => {
      httpServer.listen(PORT, '0.0.0.0', (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  };

  // Start server with error handling
  startServer()
    .then(() => {
      console.log(`
🎉 ===============================
   IP INDIA PATENT SERVER READY!
===============================
🌐 HTTP Server: http://0.0.0.0:${PORT}
📡 Socket Server: ws://0.0.0.0:${PORT}
🛒 API Endpoints: http://0.0.0.0:${PORT}/api
💚 Health Check: http://0.0.0.0:${PORT}/api/health
🔔 Real-time: OPERATIONAL
🚀 Environment: ${NODE_ENV}
📧 Email Service: ${process.env.EMAIL_USER || 'Not configured'}
===============================`);

      // 🎯 Production security info
      if (NODE_ENV === 'production') {
        console.log(`
🔒 ===============================
   PRODUCTION SECURITY ACTIVE
===============================
🛡️ Helmet: ENABLED
⚡ Rate Limiting: ACTIVE
🔐 CORS: RESTRICTED
📊 Monitoring: READY
===============================`);
      }
    })
    .catch((error) => {
      console.error('❌ FAILED TO START SERVER:');
      console.error(error);
      process.exit(1);
    });

} catch (error) {
  console.error('❌ CRITICAL ERROR DURING SERVER STARTUP:');
  console.error('Error details:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}

// 🎯 Enhanced error handling
process.on('unhandledRejection', (err, promise) => {
  console.log('💥 UNHANDLED REJECTION! Shutting down...');
  console.error('Error name:', err.name);
  console.error('Error message:', err.message);
  
  if (NODE_ENV === 'development') {
    console.error('Error stack:', err.stack);
    console.error('Promise:', promise);
  }
  
  // Close server & exit process
  if (httpServer) {
    httpServer.close(() => {
      console.log('🛑 Server closed due to unhandled rejection');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.log('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error('Error name:', err.name);
  console.error('Error message:', err.message);
  
  if (NODE_ENV === 'development') {
    console.error('Error stack:', err.stack);
  }
  
  // Close server & exit process
  if (httpServer) {
    httpServer.close(() => {
      console.log('🛑 Server closed due to uncaught exception');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// 🎯 Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  
  if (httpServer) {
    httpServer.close(() => {
      console.log('✅ HTTP server closed gracefully');
      
      // Close socket.io if available
      if (global.io) {
        global.io.close(() => {
          console.log('✅ Socket.IO server closed');
        });
      }
      
      // Give time for cleanup
      setTimeout(() => {
        process.exit(0);
      }, 1000);
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
      console.log('⚠️ Forcing server shutdown...');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  
  if (httpServer) {
    httpServer.close(() => {
      console.log('✅ HTTP server closed gracefully');
      
      // Close socket.io if available
      if (global.io) {
        global.io.close(() => {
          console.log('✅ Socket.IO server closed');
        });
      }
      
      process.exit(0);
    });
    
    // Force close after 5 seconds
    setTimeout(() => {
      console.log('⚠️ Forcing server shutdown...');
      process.exit(1);
    }, 5000);
  } else {
    process.exit(0);
  }
});

// 🎯 Memory usage monitoring (production only)
if (NODE_ENV === 'production') {
  setInterval(() => {
    const used = process.memoryUsage();
    const memoryUsage = {
      rss: Math.round(used.rss / 1024 / 1024 * 100) / 100,
      heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
      heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
      external: Math.round(used.external / 1024 / 1024 * 100) / 100
    };
    
    // Log if memory usage is high
    if (memoryUsage.heapUsed > 500) { // More than 500MB
      console.log(`⚠️ High memory usage detected: ${JSON.stringify(memoryUsage)} MB`);
    }
  }, 30000); // Check every 30 seconds
}

// Export for testing purposes
module.exports = { httpServer };