import pool from '../db.js';

// Retrieve all attendance records (all employees)
export const fetchAll = async () => {
    const [rows] = await pool.query(
        `SELECT
            a.id,
            a.user_id,
            u.full_name,
            u.employee_code,
            a.work_date,
            a.time_in,
            a.time_out,
            a.status,
            a.late_minutes,
            a.created_at
         FROM attendance a
         JOIN users u ON u.id = a.user_id
         ORDER BY a.work_date DESC, u.full_name ASC`
    );
    return rows;
};

// Retrieve all attendance records for one employee
export const fetchByUserId = async (user_id) => {
    const [rows] = await pool.query(
        `SELECT
            a.id,
            a.user_id,
            u.full_name,
            u.employee_code,
            a.work_date,
            a.time_in,
            a.time_out,
            a.status,
            a.late_minutes,
            a.created_at
         FROM attendance a
         JOIN users u ON u.id = a.user_id
         WHERE a.user_id = ?
         ORDER BY a.work_date DESC`,
        [user_id]
    );
    return rows;
};

// Retrieve one attendance record by ID
export const findById = async (id) => {
    const [rows] = await pool.query(
        `SELECT
            a.id,
            a.user_id,
            u.full_name,
            u.employee_code,
            a.work_date,
            a.time_in,
            a.time_out,
            a.status,
            a.late_minutes,
            a.created_at
         FROM attendance a
         JOIN users u ON u.id = a.user_id
         WHERE a.id = ?
         LIMIT 1`,
        [id]
    );
    return rows;
};

// Check if an attendance record already exists for a user on a given date
export const findByUserAndDate = async (user_id, work_date) => {
    const [rows] = await pool.query(
        `SELECT id FROM attendance
         WHERE user_id = ? AND work_date = ?
         LIMIT 1`,
        [user_id, work_date]
    );
    return rows;
};

// Insert attendance record
export const insert = async (record) => {
    const [result] = await pool.query(
        `INSERT INTO attendance (user_id, work_date, time_in, time_out, status, late_minutes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            record.user_id,
            record.work_date,
            record.time_in,
            record.time_out ?? null,
            record.status,
            record.late_minutes ?? 0
        ]
    );
    return result.insertId;
};

// Update attendance record
export const update = async (record) => {
    const [result] = await pool.query(
        `UPDATE attendance
         SET time_in = ?, time_out = ?, status = ?, late_minutes = ?
         WHERE id = ?`,
        [
            record.time_in,
            record.time_out ?? null,
            record.status,
            record.late_minutes ?? 0,
            record.id
        ]
    );
    return result.affectedRows;
};

// Delete attendance record
export const remove = async (id) => {
    const [result] = await pool.query(
        `DELETE FROM attendance WHERE id = ?`,
        [id]
    );
    return result.affectedRows;
};
