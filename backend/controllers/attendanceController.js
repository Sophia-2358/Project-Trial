import * as attendanceService from '../services/attendanceService.js';

// ==========================================
// GET ALL ATTENDANCE RECORDS
// GET /api/attendance
// ==========================================
export const getAllAttendance = async (req, res) => {
    try {
        const records = await attendanceService.fetchAllAttendance();
        return res.status(200).json({
            success: true,
            data: records
        });
    } catch (error) {
        console.error('Get All Attendance Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Could not retrieve attendance records.'
        });
    }
};

// ==========================================
// GET ATTENDANCE BY EMPLOYEE
// GET /api/attendance/employee/:user_id
// ==========================================
export const getAttendanceByEmployee = async (req, res) => {
    try {
        const { user_id } = req.params;
        const records = await attendanceService.fetchAttendanceByEmployee(Number(user_id));

        return res.status(200).json({
            success: true,
            data: records
        });
    } catch (error) {
        console.error('Get Attendance By Employee Error:', error);

        if (error.message === 'Employee not found.') {
            return res.status(404).json({ success: false, message: error.message });
        }

        return res.status(500).json({
            success: false,
            message: 'Could not retrieve attendance records.'
        });
    }
};

// ==========================================
// GET ONE ATTENDANCE RECORD BY ID
// GET /api/attendance/:id
// ==========================================
export const getAttendanceById = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await attendanceService.fetchAttendanceById(Number(id));

        return res.status(200).json({
            success: true,
            data: record
        });
    } catch (error) {
        console.error('Get Attendance By ID Error:', error);

        if (error.message === 'Attendance record not found.') {
            return res.status(404).json({ success: false, message: error.message });
        }

        return res.status(500).json({
            success: false,
            message: 'Could not retrieve attendance record.'
        });
    }
};

// ==========================================
// CREATE ATTENDANCE RECORD
// POST /api/attendance
// ==========================================
export const createAttendance = async (req, res) => {
    try {
        const insertId = await attendanceService.createAttendance(req.body);

        return res.status(201).json({
            success: true,
            message: 'Attendance record created successfully.',
            data: { id: insertId }
        });
    } catch (error) {
        console.error('Create Attendance Error:', error);

        const clientErrors = [
            'user_id, work_date, and time_in are required.',
            'Employee not found.',
            'An attendance record already exists for this employee on this date.'
        ];

        if (clientErrors.includes(error.message)) {
            return res.status(400).json({ success: false, message: error.message });
        }

        return res.status(500).json({
            success: false,
            message: 'Could not create attendance record.'
        });
    }
};

// ==========================================
// UPDATE ATTENDANCE RECORD
// PUT /api/attendance/:id
// ==========================================
export const updateAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const affectedRows = await attendanceService.updateAttendance(Number(id), req.body);

        return res.status(200).json({
            success: true,
            message: 'Attendance record updated successfully.',
            data: { affectedRows }
        });
    } catch (error) {
        console.error('Update Attendance Error:', error);

        if (error.message === 'Attendance record not found.') {
            return res.status(404).json({ success: false, message: error.message });
        }

        if (error.message === 'time_in is required.') {
            return res.status(400).json({ success: false, message: error.message });
        }

        return res.status(500).json({
            success: false,
            message: 'Could not update attendance record.'
        });
    }
};

// ==========================================
// DELETE ATTENDANCE RECORD
// DELETE /api/attendance/:id
// ==========================================
export const deleteAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const affectedRows = await attendanceService.deleteAttendance(Number(id));

        return res.status(200).json({
            success: true,
            message: 'Attendance record deleted successfully.',
            data: { affectedRows }
        });
    } catch (error) {
        console.error('Delete Attendance Error:', error);

        if (error.message === 'Attendance record not found.') {
            return res.status(404).json({ success: false, message: error.message });
        }

        return res.status(500).json({
            success: false,
            message: 'Could not delete attendance record.'
        });
    }
};
