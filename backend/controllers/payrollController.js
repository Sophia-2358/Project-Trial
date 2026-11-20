import * as payrollService from '../services/payrollService.js';

// ==========================================
// GET PAYROLL FOR ALL EMPLOYEES
// GET /api/payroll?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD&total_working_days=N
// ==========================================
export const getPayrollAll = async (req, res) => {
    try {
        const { date_from, date_to, total_working_days } = req.query;

        const result = await payrollService.fetchPayrollAll(
            date_from,
            date_to,
            total_working_days
        );

        return res.status(200).json({
            success: true,
            period: { date_from, date_to, total_working_days: Number(total_working_days) },
            data: result
        });
    } catch (error) {
        console.error('Get Payroll All Error:', error);

        const clientErrors = [
            'date_from, date_to, and total_working_days are required.',
            'total_working_days must be greater than 0.'
        ];

        if (clientErrors.includes(error.message)) {
            return res.status(400).json({ success: false, message: error.message });
        }

        return res.status(500).json({
            success: false,
            message: 'Could not compute payroll.'
        });
    }
};

// ==========================================
// GET PAYROLL FOR ONE EMPLOYEE
// GET /api/payroll/:user_id?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD&total_working_days=N
// ==========================================
export const getPayrollByEmployee = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { date_from, date_to, total_working_days } = req.query;

        const result = await payrollService.fetchPayrollByEmployee(
            Number(user_id),
            date_from,
            date_to,
            total_working_days
        );

        return res.status(200).json({
            success: true,
            period: { date_from, date_to, total_working_days: Number(total_working_days) },
            data: result
        });
    } catch (error) {
        console.error('Get Payroll By Employee Error:', error);

        if (error.message === 'Employee not found.') {
            return res.status(404).json({ success: false, message: error.message });
        }

        if (error.message === 'No payroll data found for this employee in the given date range.') {
            return res.status(404).json({ success: false, message: error.message });
        }

        const clientErrors = [
            'date_from, date_to, and total_working_days are required.',
            'total_working_days must be greater than 0.'
        ];

        if (clientErrors.includes(error.message)) {
            return res.status(400).json({ success: false, message: error.message });
        }

        return res.status(500).json({
            success: false,
            message: 'Could not compute payroll.'
        });
    }
};
