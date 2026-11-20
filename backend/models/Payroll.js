import pool from '../db.js';

// Retrieve payroll summary for one employee within a date range
// Counts: total days present, total late_minutes, total project_error deductions
export const fetchSummaryByUserId = async (user_id, date_from, date_to) => {
    const [rows] = await pool.query(
        `SELECT
            u.id AS user_id,
            u.full_name,
            u.employee_code,
            u.position,
            COUNT(a.id)                          AS days_present,
            COALESCE(SUM(a.late_minutes), 0)     AS total_late_minutes,
            COALESCE(SUM(pe.amount), 0)          AS total_error_deductions
         FROM users u
         LEFT JOIN attendance a
            ON a.user_id = u.id
            AND a.work_date BETWEEN ? AND ?
         LEFT JOIN project_errors pe
            ON pe.user_id = u.id
            AND pe.error_date BETWEEN ? AND ?
         WHERE u.id = ? AND u.role = 'employee'
         GROUP BY u.id`,
        [date_from, date_to, date_from, date_to, user_id]
    );
    return rows;
};

// Retrieve payroll summary for ALL employees within a date range
export const fetchSummaryAll = async (date_from, date_to) => {
    const [rows] = await pool.query(
        `SELECT
            u.id AS user_id,
            u.full_name,
            u.employee_code,
            u.position,
            COUNT(a.id)                          AS days_present,
            COALESCE(SUM(a.late_minutes), 0)     AS total_late_minutes,
            COALESCE(SUM(pe.amount), 0)          AS total_error_deductions
         FROM users u
         LEFT JOIN attendance a
            ON a.user_id = u.id
            AND a.work_date BETWEEN ? AND ?
         LEFT JOIN project_errors pe
            ON pe.user_id = u.id
            AND pe.error_date BETWEEN ? AND ?
         WHERE u.role = 'employee'
         GROUP BY u.id
         ORDER BY u.full_name ASC`,
        [date_from, date_to, date_from, date_to]
    );
    return rows;
};

// Retrieve all settings needed for payroll computation
export const fetchSettings = async () => {
    const [rows] = await pool.query(
        `SELECT setting_key, setting_value FROM settings`
    );
    // Convert array to key-value object for easy access
    const settings = {};
    for (const row of rows) {
        settings[row.setting_key] = row.setting_value;
    }
    return settings;
};
