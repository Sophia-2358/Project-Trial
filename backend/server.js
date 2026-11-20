import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import pool from './db.js';

import authRoutes       from './routes/authRoutes.js';
import employeeRoutes   from './routes/employeeRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import payrollRoutes    from './routes/payrollRoutes.js';

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(cors({
    origin:      ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}));

app.use(express.json());

app.use(session({
    secret:            process.env.SESSION_SECRET,
    resave:            false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure:   false,
        sameSite: 'lax',
        maxAge:   1000 * 60 * 60 * 2
    }
}));

// ==========================================
// ROUTES
// ==========================================
app.use('/api/auth',       authRoutes);
app.use('/api/employee',   employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payroll',    payrollRoutes);

// ==========================================
// DATABASE TEST
// ==========================================
app.get('/api/test', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 AS test');
        res.json({ success: true, message: 'Server and database are working!', data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Database error.' });
    }
});

// ==========================================
// START SERVER
// ==========================================
const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
