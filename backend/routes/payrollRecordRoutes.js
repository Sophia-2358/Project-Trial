import express from 'express';
import {
    getPayrollRecords,
    createPayrollRecord
} from '../controllers/payrollRecordController.js';

const router = express.Router();


// GET  /api/payroll-records  — all saved weekly payroll records
router.get('/', getPayrollRecords);

// POST /api/payroll-records  — save one weekly payroll record
router.post('/', createPayrollRecord);

export default router;
