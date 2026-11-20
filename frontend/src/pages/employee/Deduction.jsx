import { useState, useEffect }         from 'react'
import { useNavigate }                 from 'react-router-dom'
import EmployeeSidebar                 from '../../components/EmployeeSidebar'
import WeekPicker, { buildWeeks }      from '../../components/WeekPicker'
import StatCard                        from '../../components/StatCard'
import RecordsTable                    from '../../components/RecordsTable'
import '../../styles/employee.css'

function dateKey(d) {
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${d.getFullYear()}-${mm}-${dd}`
}

function money(value) {
    return Number(value).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
}

export default function Deduction() {
    const weeks                 = buildWeeks()
    const [user, setUser]       = useState(null)
    const [week, setWeek]       = useState(weeks[0].value)
    const [summary, setSummary] = useState(null)
    const [days, setDays]       = useState([])
    const [rates, setRates]     = useState(null)
    const [error, setError]     = useState('')
    const navigate              = useNavigate()

    useEffect(() => {
        async function checkSession() {
            try {
                const res  = await fetch('/api/auth/me', { credentials: 'include' })
                const data = await res.json().catch(() => ({}))
                if (!res.ok || !data.user || data.user.role !== 'employee') {
                    navigate('/login')
                    return
                }
                setUser(data.user)
            } catch {
                navigate('/login')
            }
        }
        checkSession()
    }, [navigate])

    useEffect(() => {
        if (!user) return
        loadDeductions()
    }, [user, week])

    async function loadDeductions() {
        setError('')
        try {
            const monday = new Date(week)
            const sunday = new Date(monday)
            sunday.setDate(monday.getDate() + 6)
            const dateTo = dateKey(sunday)

            const res  = await fetch(
                `/api/payroll/${user.id}?date_from=${week}&date_to=${dateTo}&total_working_days=5`,
                { credentials: 'include' }
            )
            const data = await res.json().catch(() => ({}))

            if (!res.ok || !data.success) {
                setError(data.message || 'Could not load your deductions.')
                setSummary(null)
                setDays([])
                return
            }

            const p = data.data
            setSummary({
                hours_late:            (p.total_late_minutes / 60).toFixed(2),
                days_absent:           p.days_absent,
                wrong_projects_amount: p.error_deduction,
                total_deduction:       (p.absence_deduction + p.late_deduction + p.error_deduction).toFixed(2)
            })

            setRates({
                late_per_hour:  p.late_deduction && p.total_late_minutes
                    ? (p.late_deduction / (p.total_late_minutes / 60)).toFixed(2)
                    : '50.00',
                absent_per_day: p.absence_deduction && p.days_absent
                    ? (p.absence_deduction / p.days_absent).toFixed(2)
                    : '500.00'
            })

            const attRes  = await fetch(`/api/attendance/employee/${user.id}`, { credentials: 'include' })
            const attData = await attRes.json().catch(() => ({}))

            const weekRecords = (attData.data || []).filter(r => {
                const d = new Date(r.work_date)
                return d >= monday && d <= sunday
            })

            setDays(weekRecords.map(r => ({
                label:    new Date(r.work_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }),
                time_in:  r.time_in  ? new Date(r.time_in).toLocaleTimeString('en-PH',  { hour: '2-digit', minute: '2-digit' }) : null,
                time_out: r.time_out ? new Date(r.time_out).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }) : null,
                hours:    (r.time_in && r.time_out) ? (new Date(r.time_out) - new Date(r.time_in)) / 3600000 : null,
                status:   r.status
            })))

        } catch {
            setError('Cannot reach the server. Please check if the backend is running.')
        }
    }

    return (
        <div className="layout-portal">
            <div className="portal">
            <EmployeeSidebar userName={user?.full_name} activePage="deduction" />

            <main className="content">
                <header className="page-head page-head-row">
                    <div>
                        <h1>Deduction History This Week</h1>
                        <p>Your salary deduction</p>
                    </div>
                    <WeekPicker weeks={weeks} value={week} onChange={setWeek} />
                </header>

                {error && <p className="alert show" role="alert">{error}</p>}

                {summary && (
                    <>
                        <section className="stats" aria-label="Weekly deductions">
                            <StatCard label="Hours Late"      value={summary.hours_late}                    sub="this week" />
                            <StatCard label="Day/s Absent"    value={summary.days_absent}                   sub="this week" />
                            <StatCard label="Wrong Project/s" value={money(summary.wrong_projects_amount)}  sub="In PHP" />
                            <StatCard label="Total deduction" value={money(summary.total_deduction)}        sub="In PHP" />
                        </section>

                        {rates && (
                            <p className="rate-note">
                                Rates: PHP {money(rates.late_per_hour)} per hour late, PHP {money(rates.absent_per_day)} per day absent.
                            </p>
                        )}
                    </>
                )}

                <article className="panel">
                    <h2>Daily records</h2>
                    <RecordsTable days={days} />
                </article>
            </main>
        </div>
        </div>
    )
}
