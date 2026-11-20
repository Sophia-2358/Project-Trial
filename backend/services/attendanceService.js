import * as attendanceModel from '../models/Attendance.js';
import * as userModel from '../models/User.js';
import pool from '../db.js';

// ==========================================
// HELPER: GET work_start FROM SETTINGS
// ==========================================
const getWorkStart = async () => {
    const [rows] = await pool.query(
        `SELECT setting_value FROM settings WHERE setting_key = 'work_start' LIMIT 1`
    );
    return rows.length > 0 ? rows[0].setting_value : '08:00:00';
};

// ==========================================
// HELPER: COMPUTE late_minutes AND status
// Given time_in (datetime string) and work_start (HH:MM:SS)
// Returns { status: 'on_time'|'late', late_minutes: number }
// ==========================================
const computeLate = (time_in, work_start) => {
    const timeInDate = new Date(time_in);

    // Build the work_start datetime on the same calendar day as time_in
    const [hours, minutes, seconds] = work_start.split(':').map(Number);
    const workStartDate = new Date(timeInDate);
    workStartDate.setHours(hours, minutes, seconds, 0);

    const diffMs = timeInDate - workStartDate;

    if (diffMs <= 0) {
        return { status: 'on_time', late_minutes: 0 };
    }

    const late_minutes = Math.ceil(diffMs / 60000);
    return { status: 'late', late_minutes };
};

// ==========================================
// FETCH ALL ATTENDANCE
// ==========================================
export const fetchAllAttendance = async () => {
    return await attendanceModel.fetchAll();
};

// ==========================================
// FETCH ATTENDANCE BY EMPLOYEE
// ==========================================
export const fetchAttendanceByEmployee = async (user_id) => {
    const employee = await userModel.findById(user_id);
    if (employee.length === 0) {
        throw new Error('Employee not found.');
    }
    return await attendanceModel.fetchByUserId(user_id);
};

// ==========================================
// FETCH ONE ATTENDANCE RECORD
// ==========================================
export const fetchAttendanceById = async (id) => {
    const rows = await attendanceModel.findById(id);
    if (rows.length === 0) {
        throw new Error('Attendance record not found.');
    }
    return rows[0];
};

// ==========================================
// CREATE ATTENDANCE RECORD
// ==========================================
export const createAttendance = async (data) => {
    const { user_id, work_date, time_in, time_out } = data;

    // Validate required fields
    if (!user_id || !work_date || !time_in) {
        throw new Error('user_id, work_date, and time_in are required.');
    }

    // Check employee exists
    const employee = await userModel.findById(user_id);
    if (employee.length === 0) {
        throw new Error('Employee not found.');
    }

    // Check no duplicate record for the same employee on the same date
    const existing = await attendanceModel.findByUserAndDate(user_id, work_date);
    if (existing.length > 0) {
        throw new Error('An attendance record already exists for this employee on this date.');
    }

    // Compute late status
    const work_start = await getWorkStart();
    const { status, late_minutes } = computeLate(time_in, work_start);

    const record = {
        user_id: Number(user_id),
        work_date,
        time_in,
        time_out: time_out ?? null,
        status,
        late_minutes
    };

    const insertId = await attendanceModel.insert(record);
    return insertId;
};

// ==========================================
// UPDATE ATTENDANCE RECORD
// ==========================================
export const updateAttendance = async (id, data) => {
    const { time_in, time_out } = data;

    if (!time_in) {
        throw new Error('time_in is required.');
    }

    // Check record exists
    const existing = await attendanceModel.findById(id);
    if (existing.length === 0) {
        throw new Error('Attendance record not found.');
    }

    // Recompute late status based on updated time_in
    const work_start = await getWorkStart();
    const { status, late_minutes } = computeLate(time_in, work_start);

    const record = {
        id: Number(id),
        time_in,
        time_out: time_out ?? null,
        status,
        late_minutes
    };

    const affectedRows = await attendanceModel.update(record);
    return affectedRows;
};

// ==========================================
// DELETE ATTENDANCE RECORD
// ==========================================
export const deleteAttendance = async (id) => {
    const existing = await attendanceModel.findById(id);
    if (existing.length === 0) {
        throw new Error('Attendance record not found.');
    }
    return await attendanceModel.remove(id);
};
