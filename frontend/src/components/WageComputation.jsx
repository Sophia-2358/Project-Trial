import { useEffect, useState } from 'react'
import { api } from '../sharedHelpers'
import '../styles/wageComputation.css'

// ==========================================
// 2.3.1 — Implement wage computation (frontend)
// ==========================================

// Formats a number as pesos, like ₱1,250.00
export function peso(n) {
    return '₱' + Number(n || 0).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
}

export const EMPTY_FORM = {
    employee_name: '',
    position:      '',
    week_start:    '',
    week_end:      '',
    hours:         '0',
    rate:          '0',
    late:          '0',
    absence:       '0',
    wrong_project: '0'
}

// Returns the form with one field changed.
// Picking a known employee fills in the position.
export function applyFieldChange(prev, name, value, employees) {
    const next = { ...prev, [name]: value }
    if (name === 'employee_name') {
        const match = employees.find(x => x.full_name.toLowerCase() === value.trim().toLowerCase())
        if (match && match.position) next.position = match.position
    }
    return next
}

// Gross = hours x rate, deductions = late + absence + wrong project, net = gross - deductions.
// Shown live while the Owner types.
export function computeWage(form) {
    const hours      = Number(form.hours)  || 0
    const rate       = Number(form.rate)   || 0
    const deductions = (Number(form.late) || 0) + (Number(form.absence) || 0) + (Number(form.wrong_project) || 0)
    const gross      = hours * rate
    return { hours, rate, gross, deductions, net: gross - deductions }
}

// Loads the employees (their names fill the Employee name suggestions).
export function useEmployees() {
    const [employees, setEmployees] = useState([])
    const [error, setError]         = useState(null)

    useEffect(() => {
        let cancelled = false

        async function load() {
            try {
                const res = await api('/api/employee')
                if (!cancelled) setEmployees(res.data || [])
            } catch (err) {
                if (!cancelled) setError(err.message)
            }
        }

        load()
        return () => { cancelled = true }
    }, [])

    return { employees, error }
}

// "Payroll entry" card: employee name, position, week dates, work hours, rate and deductions.
export function PayrollEntryFields({ form, employees, onChange }) {
    return (
        <div className="em-card" style={{ flex: 2 }}>
            <h2>Payroll entry</h2>
            <div className="em-row">
                <div>
                    <label htmlFor="employee_name">Employee name</label>
                    <input id="employee_name" name="employee_name" list="employeeNames"
                           value={form.employee_name} onChange={onChange} />
                    <datalist id="employeeNames">
                        {employees.map(x => <option key={x.id} value={x.full_name} />)}
                    </datalist>
                </div>
                <div>
                    <label htmlFor="position">Position</label>
                    <input id="position" name="position" value={form.position} onChange={onChange} />
                </div>
            </div>
            <div className="em-row">
                <div>
                    <label htmlFor="week_start">Week starting</label>
                    <input type="date" id="week_start" name="week_start" value={form.week_start} onChange={onChange} />
                </div>
                <div>
                    <label htmlFor="week_end">Week ending</label>
                    <input type="date" id="week_end" name="week_end" value={form.week_end} onChange={onChange} />
                </div>
                <div>
                    <label htmlFor="hours">Work hours</label>
                    <input type="number" id="hours" name="hours" min="0" step="0.1" value={form.hours} onChange={onChange} />
                </div>
                <div>
                    <label htmlFor="rate">Rate per hour (₱)</label>
                    <input type="number" id="rate" name="rate" min="0" step="0.01" value={form.rate} onChange={onChange} />
                </div>
            </div>
            <label>Deductions (₱)</label>
            <div className="em-row">
                <div>
                    <label htmlFor="late">Late arrival</label>
                    <input type="number" id="late" name="late" min="0" step="0.01" value={form.late} onChange={onChange} />
                </div>
                <div>
                    <label htmlFor="absence">Absence</label>
                    <input type="number" id="absence" name="absence" min="0" step="0.01" value={form.absence} onChange={onChange} />
                </div>
                <div>
                    <label htmlFor="wrong_project">Wrong project</label>
                    <input type="number" id="wrong_project" name="wrong_project" min="0" step="0.01" value={form.wrong_project} onChange={onChange} />
                </div>
            </div>
        </div>
    )
}

// "Wage computation" card: hours × rate, gross wage, total deductions and net wage.
export function WageComputationCard({ wage }) {
    return (
        <div className="em-card em-calc">
            <h2>Wage computation</h2>
            <p><span>Hours × rate</span><span>{wage.hours} × {peso(wage.rate)}</span></p>
            <p><span>Gross wage</span><span>{peso(wage.gross)}</span></p>
            <p><span>Total deductions</span><span>{peso(wage.deductions)}</span></p>
            <p className="em-net"><span>Net wage</span><span>{peso(wage.net)}</span></p>
        </div>
    )
}
