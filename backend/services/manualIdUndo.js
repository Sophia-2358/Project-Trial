import * as attendanceModel from '../models/Attendance.js';
import { fail, formatDate, findToday } from './common.js';

// ==========================================
// 2.1.3 — MANUAL ID ENTRY AND UNDO SCAN
// A typed ID is recorded by recordScan() in qrScanRecording.js, the same way
// as a QR scan (trimmed there, matched ignoring upper/lower case by
// userModel.findByEmployeeCode). This file holds the undo.
//
// UNDO THE LAST SCAN OF AN EMPLOYEE TODAY
// type: 'in' removes today's record, 'out' clears the time out
// ==========================================
export const undoScan = async ({ user_id, type }) => {
    if (!user_id || !['in', 'out'].includes(type)) {
        throw fail(400, 'user_id and type (in or out) are required.');
    }

    const record = await findToday(Number(user_id), formatDate(new Date()));
    if (!record) throw fail(404, 'There is nothing to undo.');

    if (type === 'in') {
        await attendanceModel.remove(record.id);
    } else {
        await attendanceModel.update({
            id:           record.id,
            time_in:      record.time_in,
            time_out:     null,
            status:       record.status,
            late_minutes: record.late_minutes
        });
    }
};
