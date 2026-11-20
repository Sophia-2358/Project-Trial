import * as payrollModel from '../models/Payroll.js';
import * as userModel from '../models/User.js';

// ==========================================
// HELPER: COMPUTE PAYROLL FOR ONE EMPLOYEE ROW
// Uses settings from the database (no hardcoded values)
// ==========================================
const computePayroll = (row, settings, totalWorkingDays) => {
    const dailyRate      = parseFloat(settings.absent_rate_per_day  ?? 500);
    const lateRatePerHr  = parseFloat(settings.late_rate_per_hour   ?? 50);

    const daysPresent        = Number(row.days_present);
    const totalLateMinutes   = Number(row.total_late_minutes);
    const totalErrorDeduct   = parseFloat(row.total_error_deductions);

    const daysAbsent         = totalWorkingDays - daysPresent;
    const grossPay           = daysPresent * dailyRate;
    const absenceDeduction   = daysAbsent  * dailyRate;
    const lateDeduction      = (totalLateMinutes / 60) * lateRatePerHr;
    const netPay             = grossPay - absenceDeduction - lateDeduction - totalErrorDeduct;

    return {
        user_id:              row.user_id,
        full_name:            row.full_name,
        employee_code:        row.employee_code,
        position:             row.position,
        days_present:         daysPresent,
        days_absent:          daysAbsent < 0 ? 0 : daysAbsent,
        total_late_minutes:   totalLateMinutes,
        gross_pay:            parseFloat(grossPay.toFixed(2)),
        absence_deduction:    parseFloat(absenceDeduction.toFixed(2)),
        late_deduction:       parseFloat(lateDeduction.toFixed(2)),
        error_deduction:      parseFloat(totalErrorDeduct.toFixed(2)),
        net_pay:              parseFloat(netPay.toFixed(2))
    };
};

// ==========================================
// GET PAYROLL FOR ALL EMPLOYEES
// ==========================================
export const fetchPayrollAll = async (date_from, date_to, totalWorkingDays) => {
    if (!date_from || !date_to || !totalWorkingDays) {
        throw new Error('date_from, date_to, and total_working_days are required.');
    }

    if (Number(totalWorkingDays) <= 0) {
        throw new Error('total_working_days must be greater than 0.');
    }

    const settings = await payrollModel.fetchSettings();
    const rows     = await payrollModel.fetchSummaryAll(date_from, date_to);

    return rows.map(row => computePayroll(row, settings, Number(totalWorkingDays)));
};

// ==========================================
// GET PAYROLL FOR ONE EMPLOYEE
// ==========================================
export const fetchPayrollByEmployee = async (user_id, date_from, date_to, totalWorkingDays) => {
    if (!date_from || !date_to || !totalWorkingDays) {
        throw new Error('date_from, date_to, and total_working_days are required.');
    }

    if (Number(totalWorkingDays) <= 0) {
        throw new Error('total_working_days must be greater than 0.');
    }

    // Check employee exists
    const employee = await userModel.findById(user_id);
    if (employee.length === 0) {
        throw new Error('Employee not found.');
    }

    const settings = await payrollModel.fetchSettings();
    const rows     = await payrollModel.fetchSummaryByUserId(user_id, date_from, date_to);

    if (rows.length === 0) {
        throw new Error('No payroll data found for this employee in the given date range.');
    }

    return computePayroll(rows[0], settings, Number(totalWorkingDays));
};
