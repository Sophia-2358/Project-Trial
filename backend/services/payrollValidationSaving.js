import * as payrollRecordModel from '../models/PayrollRecord.js';
import { fail } from './common.js';
import { computeWage } from './wageComputation.js';                // 2.3.1

// ==========================================
// FETCH ALL PAYROLL RECORDS
// ==========================================
export const fetchPayrollRecords = async () => {
    const rows = await payrollRecordModel.fetchAll();

    // DECIMAL columns come back as text, so turn them into numbers
    return rows.map(r => ({
        id:            r.id,
        employee_name: r.employee_name,
        position:      r.position,
        week_start:    r.week_start,
        week_end:      r.week_end,
        hours:         Number(r.hours),
        rate:          Number(r.rate),
        late:          Number(r.late_deduction),
        absence:       Number(r.absence_deduction),
        wrong_project: Number(r.wrong_project_deduction),
        gross:         Number(r.gross),
        deductions:    Number(r.deductions),
        net:           Number(r.net),
        created_at:    r.created_at
    }));
};

// ==========================================
// 2.3.2 — VALIDATE AND SAVE ONE WEEKLY PAYROLL RECORD
// ==========================================
export const createPayrollRecord = async (data) => {
    const employee_name = String(data.employee_name ?? '').trim();
    const position      = String(data.position ?? '').trim();
    const week_start    = data.week_start;
    const week_end      = data.week_end;
    const hours         = Number(data.hours);
    const rate          = Number(data.rate);
    const late          = Number(data.late ?? 0);
    const absence       = Number(data.absence ?? 0);
    const wrong_project = Number(data.wrong_project ?? 0);

    if (!employee_name)             throw fail(400, 'Enter the employee name.');
    if (!position)                  throw fail(400, 'Enter the position.');
    if (!week_start || !week_end)   throw fail(400, 'Enter the week starting and week ending dates.');
    if (week_end < week_start)      throw fail(400, 'The week ending date cannot be before the week starting date.');
    if (!(hours > 0))               throw fail(400, 'Work hours must be more than 0.');
    if (!(rate > 0))                throw fail(400, 'Rate per hour must be more than 0.');
    if (![late, absence, wrong_project].every(Number.isFinite) || late < 0 || absence < 0 || wrong_project < 0) {
        throw fail(400, 'Deductions cannot be negative.');
    }

    const existing = await payrollRecordModel.findByNameAndWeek(employee_name, week_start);
    if (existing.length > 0) {
        throw fail(409, 'A payroll record for this employee and week already exists.');
    }

    const { gross, deductions, net } = computeWage({ hours, rate, late, absence, wrong_project });   // 2.3.1
    if (deductions > gross) {
        throw fail(400, 'Deductions are larger than the gross wage.');
    }

    return await payrollRecordModel.insert({
        employee_name, position, week_start, week_end,
        hours, rate, late, absence, wrong_project,
        gross, deductions, net
    });
};
