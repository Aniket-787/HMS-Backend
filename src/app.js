const express = require('express');
const authRoutes = require('./routes/authRoutes');
const superAdminRoutes = require('./routes/superAdmin.routes');
const adminRoutes = require('./routes/admin.routes');
const receptionistRoutes = require('./routes/receptionist.routes');
const doctorRoutes = require('./routes/doctor.routes')
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: "https://hms-frontend-black.vercel.app",
  credentials: true
}));


//routes
app.use('/api/auth',authRoutes)
app.use('/api/superAdmin',superAdminRoutes)
app.use('/api/admin',adminRoutes)
app.use('/api/receptionist',receptionistRoutes)
app.use('/api/doctor',doctorRoutes)

app.get("/", (req, res) => {
  res.send("Backend is LIVE 🚀");
});

module.exports = app;