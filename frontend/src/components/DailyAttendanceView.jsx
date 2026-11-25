import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, toDateKey, formatClock } from '../sharedHelpers'
import { getStatus, StatusPill } from './AttendanceSummaryStatus'   // 2.2.2

// ==========================================
// 2.2.1 — Implement daily attendance view (frontend)
// ==========================================

// Loads the employees and every attendance record.
// `error` is the message to show if loading fails, otherwise null.
export function useAttendanceData() {
    const [employees, setEmployees] = useState([])
    const [records, setRecords]     = useState([])
    const [error, setError]         = useState(null)

    useEffect(() => {
        let cancelled = false

        async function load() {
            try {
                const [emp, att] = await Promise.all([
                    api('/api/employee'),
                    api('/api/attendance')
                ])
                if (cancelled) return
                setEmployees(emp.data || [])
                setRecords(att.data || [])
            } catch (err) {
                if (!cancelled) setError(err.message)
            }
        }

        load()
        return () => { cancelled = true }
    }, [])

    return { employees, records, error }
}

// Hours between two date/times, to one decimal. 0 if there is no time out.
function hoursBetween(timeIn, timeOut) {
    if (!timeIn || !timeOut) return 0
    const minutes = (new Date(timeOut) - new Date(timeIn)) / 60000
    return Math.round(minutes / 6) / 10
}

// One row per employee for the chosen date, filtered by the searched name.
export function buildDailyRows(employees, records, date, search) {
    const term = search.toLowerCase()
    return employees
        .filter(e => e.full_name.toLowerCase().includes(term))
        .map(e => {
            const a = records.find(r => r.user_id === e.id && toDateKey(r.work_date) === date)
            return {
                id:       e.id,
                name:     e.full_name,
                position: e.position,
                time_in:  a ? a.time_in  : null,
                time_out: a ? a.time_out : null,
                hours:    a ? hoursBetween(a.time_in, a.time_out) : 0,
                status:   getStatus(a)                                  // 2.2.2
            }
        })
}

// Page title with the "Send to payroll" and "Scan attendance" buttons.
export function AttendanceHeader() {
    return (
        <div className="em-top">
            <div>
                <h1>Attendance</h1>
                <p className="em-sub">Time in and time out of your crew, recorded from QR scans</p>
            </div>
            <div className="em-no-print">
                <Link className="em-btn em-light" to="/owner/employee-payroll">Send to payroll</Link>
                {' '}
                <Link className="em-btn" to="/owner/scan-attendance">Scan attendance</Link>
            </div>
        </div>
    )
}

// Date picker (starts on today) and name search.
export function AttendanceFilters({ date, onDateChange, search, onSearchChange }) {
    return (
        <div className="em-row">
            <div>
                <label htmlFor="date">Date</label>
                <input type="date" id="date" value={date} onChange={e => onDateChange(e.target.value)} />
            </div>
            <div>
                <label htmlFor="search">Employee</label>
                <input id="search" placeholder="Search name" value={search} onChange={e => onSearchChange(e.target.value)} />
            </div>
        </div>
    )
}

// Table of employee, position, time in, time out, hours and status.
export function AttendanceTable({ rows }) {
    return (
        <table>
            <thead>
                <tr>
                    <th>Employee</th><th>Position</th><th>Time in</th>
                    <th>Time out</th><th>Hours</th><th>Status</th>
                </tr>
            </thead>
            <tbody>
                {rows.length === 0 ? (
                    <tr><td colSpan={6}>No attendance records yet.</td></tr>
                ) : rows.map(r => (
                    <tr key={r.id}>
                        <td>{r.name}</td>
                        <td>{r.position}</td>
                        <td>{formatClock(r.time_in)}</td>
                        <td>{formatClock(r.time_out)}</td>
                        <td>{r.hours.toFixed(1)}</td>
                        <td><StatusPill status={r.status} /></td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
