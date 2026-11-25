import express from 'express';
import {
    scanAttendance,
    undoScan
} from '../controllers/attendanceScanController.js';

const router = express.Router();


// POST /api/attendance-scan       — record a time in or time out from a QR scan
router.post('/', scanAttendance);

// POST /api/attendance-scan/undo  — undo the last scan of an employee today
router.post('/undo', undoScan);

export default router;
