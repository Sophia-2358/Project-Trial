import express from 'express';
import {
    getMyToday,
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee
} from '../controllers/employeeController.js';

const router = express.Router();

// GET  /api/employee/my-today — get logged-in employee's QR and today's attendance
// NOTE: this must be BEFORE /:id to avoid "my-today" being treated as an id
router.get('/my-today', getMyToday);

// GET  /api/employee          — get all employees
router.get('/', getAllEmployees);

// GET  /api/employee/:id      — get one employee
router.get('/:id', getEmployeeById);

// POST /api/employee          — create employee
router.post('/', createEmployee);

// PUT  /api/employee/:id      — update employee
router.put('/:id', updateEmployee);

// DELETE /api/employee/:id    — delete employee
router.delete('/:id', deleteEmployee);

export default router;
