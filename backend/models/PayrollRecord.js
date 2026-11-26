import pool from '../db.js';

// Retrieve all saved weekly payroll records, newest week first
export const fetchAll = async () => {
    const [rows] = await pool.query(
        `SELECT
            id,
            employee_name,
            position,
            DATE_FORMAT(week_start, '%Y-%m-%d') AS week_start,
            DATE_FORMAT(week_end,   '%Y-%m-%d') AS week_end,
            hours,
            rate,
            late_deduction,
            absence_deduction,
            wrong_project_deduction,
            gross,
            deductions,
            net,
            created_at
         FROM payroll_records
         ORDER BY week_start DESC, employee_name ASC`
    );
    return rows;
};

// Check if a record already exists for an employee and week
export const findByNameAndWeek = async (employee_name, week_start) => {
    const [rows] = await pool.query(
        `SELECT id FROM payroll_records
         WHERE LOWER(employee_name) = LOWER(?) AND week_start = ?
         LIMIT 1`,
        [employee_name, week_start]
    );
    return rows;
};

// Insert one weekly payroll record
export const insert = async (record) => {
    const [result] = await pool.query(
        `INSERT INTO payroll_records
            (employee_name, position, week_start, week_end, hours, rate,
             late_deduction, absence_deduction, wrong_project_deduction,
             gross, deductions, net)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            record.employee_name,
            record.position,
            record.week_start,
            record.week_end,
            record.hours,
            record.rate,
            record.late,
            record.absence,
            record.wrong_project,
            record.gross,
            record.deductions,
            record.net
        ]
    );
    return result.insertId;
};
