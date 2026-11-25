import { recordScan } from '../services/qrScanRecording.js';      // 2.1.1
import { undoScan as undoLastScan } from '../services/manualIdUndo.js';   // 2.1.3

const sendError = (res, label, error, fallback) => {
    console.error(`${label}:`, error);
    if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: fallback });
};

// ==========================================
// RECORD A QR SCAN (TIME IN / TIME OUT)
// POST /api/attendance-scan   body: { code, mode }
// ==========================================
export const scanAttendance = async (req, res) => {
    try {
        const result = await recordScan(req.body);
        return res.status(201).json({ success: true, data: result });
    } catch (error) {
        return sendError(res, 'Scan Attendance Error', error, 'Could not record the scan.');
    }
};

// ==========================================
// UNDO THE LAST SCAN
// POST /api/attendance-scan/undo   body: { user_id, type }
// ==========================================
export const undoScan = async (req, res) => {
    try {
        await undoLastScan(req.body);
        return res.status(200).json({ success: true, message: 'Last scan undone.' });
    } catch (error) {
        return sendError(res, 'Undo Scan Error', error, 'Could not undo the scan.');
    }
};
