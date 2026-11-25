import * as attendanceModel from '../models/Attendance.js';
import * as userModel from '../models/User.js';
import { formatDate, formatDateTime, findToday } from './common.js';
import {
    validateScanInput,
    assertEmployeeCanScan,
    resolveScanType,
    assertCanTimeIn,
    assertCanTimeOut,
    getWorkStart,
    computeLate
} from './scanRules.js';                                            // 2.1.2

// Hours between two times, to one decimal (returned on time out)
const hoursBetween = (timeIn, timeOut) =>
    Math.round((new Date(timeOut) - new Date(timeIn)) / 360000) / 10;

// ==========================================
// 2.1.1 — RECORD A SCAN (TIME IN OR TIME OUT)
// Finds the employee by the scanned code, saves the time in or time out for
// today, and returns the employee's details with the recorded time
// (and the hours worked on time out).
// mode: 'auto' | 'in' | 'out'
// ==========================================
export const recordScan = async (body) => {
    const { text, mode } = validateScanInput(body);                 // 2.1.2

    const found = await userModel.findByEmployeeCode(text);
    const employee = found[0];
    assertEmployeeCanScan(employee);                                // 2.1.2

    const now       = new Date();
    const work_date = formatDate(now);
    const record    = await findToday(employee.id, work_date);

    const type = resolveScanType(mode, record);                     // 2.1.2 (Auto mode)

    const info = {
        id:            employee.id,
        full_name:     employee.full_name,
        position:      employee.position,
        employee_code: employee.employee_code
    };

    if (type === 'in') {
        assertCanTimeIn(employee, record);                          // 2.1.2

        const { status, late_minutes } = computeLate(now, await getWorkStart());   // 2.1.2
        await attendanceModel.insert({
            user_id:   employee.id,
            work_date,
            time_in:   formatDateTime(now),
            time_out:  null,
            status,
            late_minutes
        });

        return { type: 'in', employee: info, work_date, time: now.toISOString(), status, late_minutes };
    }

    assertCanTimeOut(employee, record);                             // 2.1.2

    await attendanceModel.update({
        id:           record.id,
        time_in:      record.time_in,
        time_out:     formatDateTime(now),
        status:       record.status,
        late_minutes: record.late_minutes
    });

    return {
        type: 'out',
        employee: info,
        work_date,
        time: now.toISOString(),
        status: record.status,
        late_minutes: record.late_minutes,
        hours: hoursBetween(record.time_in, now)
    };
};
