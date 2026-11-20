import express from 'express';
import {
    getAllAttendance,
    getAttendanceByEmployee,
    getAttendanceById,
    createAttendance,
    updateAttendance,
    deleteAttendance
} from '../controllers/attendanceController.js';

const router = express.Router();

// GET    /api/attendance                        — get all attendance records
router.get('/', getAllAttendance);

// GET    /api/attendance/employee/:user_id      — get all records for one employee
router.get('/employee/:user_id', getAttendanceByEmployee);

// GET    /api/attendance/:id                    — get one attendance record
router.get('/:id', getAttendanceById);

// POST   /api/attendance                        — create attendance record
router.post('/', createAttendance);

// PUT    /api/attendance/:id                    — update attendance record
router.put('/:id', updateAttendance);

// DELETE /api/attendance/:id                    — delete attendance record
router.delete('/:id', deleteAttendance);

export default router;
