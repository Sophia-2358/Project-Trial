import * as userService from '../services/userService.js';
import pool from '../db.js';

// ==========================================
// GET EMPLOYEE QR CODE AND TODAY'S ATTENDANCE
// GET /api/employee/my-today
// ==========================================
export const getMyToday = async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'You are not logged in.' });
        }

        if (req.session.user.role !== 'employee') {
            return res.status(403).json({ success: false, message: 'Employee access only.' });
        }

        const userId = req.session.user.id;

        const [rows] = await pool.query(
            `SELECT
                u.full_name,
                u.employee_code,
                u.position,
                u.status AS account_status,
                DATE_FORMAT(CURDATE(), '%W, %M %e, %Y') AS date_label,
                DATE_FORMAT(a.time_in,  '%h:%i %p')     AS time_in,
                DATE_FORMAT(a.time_out, '%h:%i %p')     AS time_out,
                a.status AS attendance_status
             FROM users u
             LEFT JOIN attendance a
                ON a.user_id = u.id AND a.work_date = CURDATE()
             WHERE u.id = ? AND u.role = 'employee'
             LIMIT 1`,
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Employee account not found.' });
        }

        const emp = rows[0];

        return res.status(200).json({
            success: true,
            employee: {
                full_name:     emp.full_name,
                employee_code: emp.employee_code,
                position:      emp.position,
                status:        emp.account_status
            },
            today: {
                date_label: emp.date_label,
                time_in:    emp.time_in,
                time_out:   emp.time_out,
                status:     emp.attendance_status || 'pending'
            }
        });

    } catch (error) {
        console.error('Get Employee Today Error:', error);
        return res.status(500).json({ success: false, message: 'Could not load your QR code and attendance.' });
    }
};

// ==========================================
// GET ALL EMPLOYEES
// GET /api/employee
// ==========================================
export const getAllEmployees = async (req, res) => {
    try {
        const employees = await userService.fetchAllEmployees();
        return res.status(200).json({
            success: true,
            data: employees
        });
    } catch (error) {
        console.error('Get All Employees Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Could not retrieve employees.'
        });
    }
};

// ==========================================
// GET ONE EMPLOYEE BY ID
// GET /api/employee/:id
// ==========================================
export const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await userService.fetchEmployeeById(Number(id));

        return res.status(200).json({
            success: true,
            data: employee
        });
    } catch (error) {
        console.error('Get Employee By ID Error:', error);

        if (error.message === 'Employee not found.') {
            return res.status(404).json({ success: false, message: error.message });
        }

        return res.status(500).json({
            success: false,
            message: 'Could not retrieve employee.'
        });
    }
};

// ==========================================
// CREATE EMPLOYEE
// POST /api/employee
// ==========================================
export const createEmployee = async (req, res) => {
    try {
        const insertId = await userService.createEmployee(req.body);

        return res.status(201).json({
            success: true,
            message: 'Employee created successfully.',
            data: { id: insertId }
        });
    } catch (error) {
        console.error('Create Employee Error:', error);

        const clientErrors = [
            'full_name, username, employee_code, and password are required.',
            'Password must be at least 8 characters.',
            'Username is already taken.',
            'Employee code is already in use.'
        ];

        if (clientErrors.includes(error.message)) {
            return res.status(400).json({ success: false, message: error.message });
        }

        return res.status(500).json({
            success: false,
            message: 'Could not create employee.'
        });
    }
};

// ==========================================
// UPDATE EMPLOYEE
// PUT /api/employee/:id
// ==========================================
export const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const affectedRows = await userService.updateEmployee(Number(id), req.body);

        return res.status(200).json({
            success: true,
            message: 'Employee updated successfully.',
            data: { affectedRows }
        });
    } catch (error) {
        console.error('Update Employee Error:', error);

        if (error.message === 'Employee not found.') {
            return res.status(404).json({ success: false, message: error.message });
        }

        const clientErrors = [
            'full_name, username, employee_code, and status are required.',
            'Status must be active or suspended.',
            'Username is already taken.',
            'Employee code is already in use.'
        ];

        if (clientErrors.includes(error.message)) {
            return res.status(400).json({ success: false, message: error.message });
        }

        return res.status(500).json({
            success: false,
            message: 'Could not update employee.'
        });
    }
};

// ==========================================
// DELETE EMPLOYEE
// DELETE /api/employee/:id
// ==========================================
export const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const affectedRows = await userService.deleteEmployee(Number(id));

        return res.status(200).json({
            success: true,
            message: 'Employee deleted successfully.',
            data: { affectedRows }
        });
    } catch (error) {
        console.error('Delete Employee Error:', error);

        if (error.message === 'Employee not found.') {
            return res.status(404).json({ success: false, message: error.message });
        }

        return res.status(500).json({
            success: false,
            message: 'Could not delete employee.'
        });
    }
};
