# Setup Instructions for IP India Patent Auto-Fill System

## 🚀 Quick Setup Guide

### Prerequisites
- Node.js (v16 or higher) - [Download here](https://nodejs.org/)
- MongoDB (local or cloud) - [Download here](https://www.mongodb.com/try/download/community)
- Gmail account for email service

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 2: Configure Environment Variables

**Backend (.env):**
```env
MONGODB_URI=mongodb://localhost:27017/ip_india_patent
EMAIL_USER=udditkantsinha@gmail.com
EMAIL_PASS=bwzn snqd lfbb mpyy
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRES_IN=30d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
ADMIN_EMAIL=udditkantsinha@gmail.com
ADMIN_PASSWORD=admin123
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=SITABIENCEIP Patent System
VITE_APP_VERSION=1.0.0
VITE_SUPPORT_EMAIL=udditkantsinha@gmail.com
VITE_COMPANY_NAME=SITABIENCEIP
```

### Step 3: Start MongoDB

**Local MongoDB:**
```bash
# Start MongoDB service
mongod
```

**Or use MongoDB Atlas (Cloud):**
- Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
- Create cluster and get connection string
- Update `MONGODB_URI` in backend/.env

### Step 4: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 5: Access the Application

- **Admin Dashboard**: http://localhost:3000
- **API Server**: http://localhost:5000
- **Default Login**: admin@sitabienceip.com / admin123

## 📧 Email Configuration

### Gmail App Password Setup
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification (enable if not already)
3. App passwords → Generate password for "Mail"
4. Use the generated password in `EMAIL_PASS`

### Email Template Features
- ✅ Professional design with company branding
- ✅ Mobile responsive layout
- ✅ Clear call-to-action buttons
- ✅ Security notices and instructions
- ✅ 30-day expiry notice

## 🗄️ Database Setup

### MongoDB Collections
The system will automatically create these collections:
- `formsubmissions` - Client form data
- `admins` - Admin user accounts

### Sample Admin Account
```javascript
{
  email: "admin@sitabienceip.com",
  password: "admin123",
  name: "SITABIENCEIP Admin",
  role: "admin"
}
```

## 🔧 Development Commands

### Backend Commands
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests
```

### Frontend Commands
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 🚀 Production Deployment

### Backend Deployment
1. Set production environment variables
2. Deploy to Heroku, AWS, or your preferred platform
3. Set up MongoDB Atlas for production database
4. Configure SSL certificate

### Frontend Deployment
1. Build production bundle: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred platform
3. Update API URL to production backend

### Production Environment Variables
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
EMAIL_USER=your-production-email
EMAIL_PASS=your-production-email-password
JWT_SECRET=your-production-secret-key
FRONTEND_URL=https://your-frontend-domain.com
```

## 🧪 Testing the System

### 1. Test Email Service
1. Login to admin dashboard
2. Click "Send Invitation"
3. Enter a test email address
4. Check email delivery

### 2. Test Form Submission
1. Click the form link in the email
2. Fill out the form (all fields optional)
3. Test auto-save functionality
4. Submit the form

### 3. Test Admin Features
1. View submission in dashboard
2. Edit form fields
3. Test bulk email functionality

## 🔍 Troubleshooting

### Common Issues

**MongoDB Connection Error:**
```bash
# Make sure MongoDB is running
mongod

# Or check if MongoDB service is running
brew services start mongodb-community  # macOS
sudo systemctl start mongod           # Linux
```

**Email Not Sending:**
- Check Gmail app password
- Verify 2-factor authentication is enabled
- Check email credentials in .env file

**Frontend Not Loading:**
- Check if backend is running on port 5000
- Verify VITE_API_URL in frontend/.env
- Check browser console for errors

**CORS Errors:**
- Verify FRONTEND_URL in backend/.env
- Check if frontend is running on correct port

### Logs and Debugging

**Backend Logs:**
```bash
cd backend
npm run dev
# Check console for detailed logs
```

**Frontend Logs:**
- Open browser Developer Tools
- Check Console tab for errors
- Check Network tab for API calls

## 📱 Mobile Testing

### Test on Mobile Devices
1. Use your phone's browser
2. Navigate to http://your-ip:3000
3. Test form functionality
4. Verify responsive design

### Mobile Features
- ✅ Touch-friendly interface
- ✅ Responsive form layout
- ✅ Mobile-optimized email templates
- ✅ Auto-save on mobile

## 🔐 Security Checklist

### Development
- [ ] Change default JWT secret
- [ ] Use strong admin password
- [ ] Enable MongoDB authentication
- [ ] Use HTTPS in production

### Production
- [ ] Set secure environment variables
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Set up SSL certificate
- [ ] Regular security updates

## 📊 Performance Optimization

### Backend
- Database indexing
- Connection pooling
- Rate limiting
- Error handling

### Frontend
- Code splitting
- Lazy loading
- Image optimization
- Bundle size optimization

## 🆘 Support

If you encounter any issues:

1. **Check the logs** - Both backend and frontend
2. **Verify environment variables** - All required variables set
3. **Test individual components** - Email, database, API
4. **Check network connectivity** - MongoDB, email service

**Contact Support:**
- Email: udditkantsinha@gmail.com
- Company: SITABIENCEIP

---

**Happy Coding! 🚀**
