import pool from '../db.js';

// Retrieve all employees
export const fetchAll = async () => {
    const [rows] = await pool.query(
        `SELECT id, role, full_name, username, employee_code, position, email, status
         FROM users
         WHERE role = 'employee'
         ORDER BY full_name ASC`
    );
    return rows;
};

// Retrieve one user by ID
export const findById = async (id) => {
    const [rows] = await pool.query(
        `SELECT id, role, full_name, username, employee_code, position, email, status
         FROM users
         WHERE id = ?
         LIMIT 1`,
        [id]
    );
    return rows;
};

// Retrieve one user by employee_code
export const findByEmployeeCode = async (employee_code) => {
    const [rows] = await pool.query(
        `SELECT id, role, full_name, username, employee_code, position, email, status
         FROM users
         WHERE employee_code = ?
         LIMIT 1`,
        [employee_code]
    );
    return rows;
};

// Retrieve one user by username
export const findByUsername = async (username) => {
    const [rows] = await pool.query(
        `SELECT id, role, full_name, username, employee_code, position, email, status
         FROM users
         WHERE username = ?
         LIMIT 1`,
        [username]
    );
    return rows;
};

// Insert new employee
export const insert = async (user) => {
    const [result] = await pool.query(
        `INSERT INTO users (role, full_name, username, employee_code, position, email, password_hash, status)
         VALUES ('employee', ?, ?, ?, ?, ?, ?, 'active')`,
        [
            user.full_name,
            user.username,
            user.employee_code,
            user.position ?? null,
            user.email ?? null,
            user.password_hash
        ]
    );
    return result.insertId;
};

// Update employee
export const update = async (user) => {
    const [result] = await pool.query(
        `UPDATE users
         SET full_name = ?, username = ?, employee_code = ?, position = ?, email = ?, status = ?
         WHERE id = ? AND role = 'employee'`,
        [
            user.full_name,
            user.username,
            user.employee_code,
            user.position ?? null,
            user.email ?? null,
            user.status,
            user.id
        ]
    );
    return result.affectedRows;
};

// Delete employee
export const remove = async (id) => {
    const [result] = await pool.query(
        `DELETE FROM users WHERE id = ? AND role = 'employee'`,
        [id]
    );
    return result.affectedRows;
};
