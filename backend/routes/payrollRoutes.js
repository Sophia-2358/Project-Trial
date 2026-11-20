import express from 'express';
import {
    getPayrollAll,
    getPayrollByEmployee
} from '../controllers/payrollController.js';

const router = express.Router();

// GET /api/payroll?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD&total_working_days=N
// — compute payroll for all employees
router.get('/', getPayrollAll);

// GET /api/payroll/:user_id?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD&total_working_days=N
// — compute payroll for one employee
router.get('/:user_id', getPayrollByEmployee);

export default router;
