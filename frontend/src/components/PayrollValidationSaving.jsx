import { useCallback, useEffect, useState } from 'react'
import { api } from '../sharedHelpers'
import { peso } from './WageComputation'          // 2.3.1
import '../styles/payrollValidationSaving.css'

// ==========================================
// 2.3.2 — Implement payroll validation and saving (frontend)
// ==========================================

// Checks the payroll form before it is sent.
// Returns the values to send, or throws an Error with the message to show.
export function validatePayroll(form) {
    const fail = text => { throw new Error(text) }

    const name     = form.employee_name.trim()
    const position = form.position.trim()
    const h        = Number(form.hours)
    const r        = Number(form.rate)
    const late     = Number(form.late)
    const abs      = Number(form.absence)
    const wrong    = Number(form.wrong_project)
    const start    = form.week_start
    const end      = form.week_end

    if (!name)                  fail('Enter the employee name.')
    if (!position)              fail('Enter the position.')
    if (!start || !end)         fail('Enter the week starting and week ending dates.')
    if (end < start)            fail('The week ending date cannot be before the week starting date.')
    if (!(h > 0))               fail('Work hours must be more than 0.')
    if (!(r > 0))               fail('Rate per hour must be more than 0.')
    if (late < 0 || abs < 0 || wrong < 0) fail('Deductions cannot be negative.')

    const grossWage       = Math.round(h * r * 100) / 100
    const totalDeductions = Math.round((late + abs + wrong) * 100) / 100
    if (totalDeductions > grossWage) fail('Deductions are larger than the gross wage.')

    return {
        employee_name: name,
        position,
        week_start:    start,
        week_end:      end,
        hours:         h,
        rate:          r,
        late,
        absence:       abs,
        wrong_project: wrong
    }
}

// Saves one weekly payroll record. Throws if the backend rejects it
// (for example when the employee and week already have a record).
export async function savePayrollRecord(values) {
    await api('/api/payroll-records', { method: 'POST', body: values })
}

// Loads the saved payroll records. Call reload() after saving a new one.
export function usePayrollRecords() {
    const [records, setRecords] = useState([])
    const [error, setError]     = useState(null)

    const reload = useCallback(async () => {
        try {
            const res = await api('/api/payroll-records')
            setRecords(res.data || [])
        } catch (err) {
            setError(err.message)
        }
    }, [])

    useEffect(() => { reload() }, [reload])

    return { records, error, reload }
}

// "Save payroll record" button (submits the payroll form).
export function SavePayrollButton() {
    return <button className="em-full">Save payroll record</button>
}

// "Payroll records" card: the saved weekly records.
export function PayrollRecordsTable({ records }) {
    return (
        <div className="em-card">
            <h2>Payroll records</h2>
            <table>
                <thead>
                    <tr>
                        <th>Employee</th><th>Position</th><th>Week</th><th>Hours</th>
                        <th>Gross</th><th>Deductions</th><th>Net</th>
                    </tr>
                </thead>
                <tbody>
                    {records.length === 0 ? (
                        <tr><td colSpan={7}>No payroll records yet.</td></tr>
                    ) : records.map(r => (
                        <tr key={r.id}>
                            <td>{r.employee_name}</td>
                            <td>{r.position}</td>
                            <td>{r.week_start} to {r.week_end}</td>
                            <td>{Number(r.hours).toFixed(1)}</td>
                            <td>{peso(r.gross)}</td>
                            <td>{peso(r.deductions)}</td>
                            <td>{peso(r.net)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
