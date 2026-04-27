const express = require('express');
const authRoutes = require('./routes/authRoutes');
const superAdminRoutes = require('./routes/superAdmin.routes');
const adminRoutes = require('./routes/admin.routes');
const receptionistRoutes = require('./routes/receptionist.routes');
const dischargeSummeryRoutes = require('./routes/dischargeSummery.routes')
const doctorRoutes = require('./routes/doctor.routes')
const revenueRoutes = require('./routes/revenue.routes')
const appointmentRequestRoutes = require('./routes/appointmentRequest.routes');
const reportsRoutes = require('./routes/reports.routes');
const hospitalModel = require('./models/hospital.model');
const QRCode = require('qrcode');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: [
    "https://hms-frontend-black.vercel.app",
    "http://localhost:3001"
  ],
  credentials: true
}));


//routes
app.use('/api/auth',authRoutes)
app.use('/api/superAdmin',superAdminRoutes)
app.use('/api/admin',adminRoutes)
app.use('/api/receptionist',receptionistRoutes)
app.use('/api/doctor',doctorRoutes)
app.use('/api/discharge',dischargeSummeryRoutes)
app.use('/api/analytics',revenueRoutes)
app.use('/api/appointment-request', appointmentRequestRoutes)
app.use('/api/reports', reportsRoutes)

// QR Code Generator - Get QR code for a hospital
app.get('/api/hospital/:id/qrcode', async (req, res) => {
  try {
    const hospital = await hospitalModel.findById(req.params.id);
    
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    // Get frontend URL from environment or use default
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const appointmentUrl = `${frontendUrl}/appointment/${req.params.id}`;

    // Generate QR code as base64
    const qrCodeDataUrl = await QRCode.toDataURL(appointmentUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    res.status(200).json({
      hospital: {
        _id: hospital._id,
        name: hospital.name,
        logo: hospital.logo
      },
      qrCode: qrCodeDataUrl,
      url: appointmentUrl
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




app.get("/", (req, res) => {
  res.send("Backend is LIVE 🚀");
});

module.exports = app;