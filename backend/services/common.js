import * as attendanceModel from '../models/Attendance.js';

// Small helpers shared by the attendance scan and payroll services.

export const fail = (status, message) => Object.assign(new Error(message), { status });

const pad = (n) => String(n).padStart(2, '0');
export const formatDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const formatDateTime = (d) =>
    `${formatDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

// Today's attendance record of an employee, or null
export const findToday = async (user_id, work_date) => {
    const found = await attendanceModel.findByUserAndDate(user_id, work_date);
    if (found.length === 0) return null;
    const rows = await attendanceModel.findById(found[0].id);
    return rows[0] ?? null;
};
