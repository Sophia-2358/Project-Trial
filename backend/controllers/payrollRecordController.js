import * as payrollRecordService from '../services/payrollValidationSaving.js';

// ==========================================
// GET ALL PAYROLL RECORDS
// GET /api/payroll-records
// ==========================================
export const getPayrollRecords = async (req, res) => {
    try {
        const records = await payrollRecordService.fetchPayrollRecords();
        return res.status(200).json({ success: true, data: records });
    } catch (error) {
        console.error('Get Payroll Records Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Could not retrieve payroll records.'
        });
    }
};

// ==========================================
// SAVE ONE WEEKLY PAYROLL RECORD
// POST /api/payroll-records
// ==========================================
export const createPayrollRecord = async (req, res) => {
    try {
        const id = await payrollRecordService.createPayrollRecord(req.body);
        return res.status(201).json({
            success: true,
            message: 'Payroll record saved.',
            data: { id }
        });
    } catch (error) {
        console.error('Create Payroll Record Error:', error);

        if (error.status) {
            return res.status(error.status).json({ success: false, message: error.message });
        }

        return res.status(500).json({
            success: false,
            message: 'Could not save the payroll record.'
        });
    }
};
