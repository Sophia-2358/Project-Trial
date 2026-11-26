import pool from '../db.js';
import { fail } from './common.js';

// ==========================================
// 2.1.2 — ATTENDANCE SCAN RULES AND VALIDATION
// ==========================================

// Checks the request body. Returns the cleaned code and mode.
export const validateScanInput = ({ code, mode = 'auto' }) => {
    const text = String(code ?? '').trim();
    if (!text) throw fail(400, 'Enter the employee ID.');
    if (!['auto', 'in', 'out'].includes(mode)) throw fail(400, 'Invalid scan mode.');
    return { text, mode };
};

// Reject an unrecognized code (or a non-employee) and an inactive account.
export const assertEmployeeCanScan = (employee) => {
    if (!employee || employee.role !== 'employee') {
        throw fail(404, 'QR code not recognized. Nothing was recorded.');
    }
    if (employee.status && employee.status !== 'active') {
        throw fail(403, `${employee.full_name}'s account is not active.`);
    }
};

// Auto mode: the first scan of the day is time in, the next is time out.
export const resolveScanType = (mode, record) => {
    if (mode !== 'auto') return mode;
    return record && record.time_in ? 'out' : 'in';
};

// Reject a second time in on the same day.
export const assertCanTimeIn = (employee, record) => {
    if (record && record.time_in) throw fail(409, `${employee.full_name} already timed in today.`);
};

// Reject a time out with no time in, and a second time out on the same day.
export const assertCanTimeOut = (employee, record) => {
    if (!record || !record.time_in) throw fail(409, `${employee.full_name} has no time in today.`);
    if (record.time_out)            throw fail(409, `${employee.full_name} already timed out today.`);
};

// Work start time from the settings table (HH:MM:SS), 08:00:00 if not set
export const getWorkStart = async () => {
    const [rows] = await pool.query(
        `SELECT setting_value FROM settings WHERE setting_key = 'work_start' LIMIT 1`
    );
    return rows.length > 0 ? rows[0].setting_value : '08:00:00';
};

// Late status and late minutes for a time in (after the work start = late)
export const computeLate = (timeIn, work_start) => {
    const [hours, minutes, seconds] = work_start.split(':').map(Number);
    const workStartDate = new Date(timeIn);
    workStartDate.setHours(hours, minutes, seconds || 0, 0);

    const diffMs = timeIn - workStartDate;
    if (diffMs <= 0) return { status: 'on_time', late_minutes: 0 };
    return { status: 'late', late_minutes: Math.ceil(diffMs / 60000) };
};
