import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import EmployeeSidebar         from '../../components/EmployeeSidebar'
import WeekPicker, { buildWeeks } from '../../components/WeekPicker'
import StatCard                from '../../components/StatCard'
import RecordsTable            from '../../components/RecordsTable'
import '../../styles/employee.css'

export default function Attendance() {
    const weeks                     = buildWeeks()
    const [user, setUser]           = useState(null)
    const [week, setWeek]           = useState(weeks[0].value)
    const [summary, setSummary]     = useState(null)
    const [days, setDays]           = useState([])
    const [workStart, setWorkStart] = useState('8:00 AM')
    const [error, setError]         = useState('')
    const navigate                  = useNavigate()

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
        loadAttendance()
    }, [user, week])

    async function loadAttendance() {
        setError('')
        try {
            const res  = await fetch(`/api/attendance/employee/${user.id}`, { credentials: 'include' })
            const data = await res.json().catch(() => ({}))

            if (!res.ok || !data.success) {
                setError(data.message || 'Could not load your attendance.')
                return
            }

            const monday = new Date(week)
            const sunday = new Date(monday)
            sunday.setDate(monday.getDate() + 6)

            const weekRecords = (data.data || []).filter(r => {
                const d = new Date(r.work_date)
                return d >= monday && d <= sunday
            })

            const totalMinutes = weekRecords.reduce((sum, r) => {
                if (!r.time_in || !r.time_out) return sum
                return sum + (new Date(r.time_out) - new Date(r.time_in)) / 60000
            }, 0)

            setSummary({
                days_present:  weekRecords.length,
                total_hours:   totalMinutes / 60,
                late_arrivals: weekRecords.filter(r => r.status === 'late').length
            })

            setWorkStart('8:00 AM')

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
            <EmployeeSidebar userName={user?.full_name} activePage="attendance" />

            <main className="content">
                <header className="page-head page-head-row">
                    <div>
                        <h1>Attendance history</h1>
                        <p>Your time in and time out records</p>
                    </div>
                    <WeekPicker weeks={weeks} value={week} onChange={setWeek} />
                </header>

                {error && <p className="alert show" role="alert">{error}</p>}

                {summary && (
                    <section className="stats" aria-label="Weekly summary">
                        <StatCard label="Days present"  value={summary.days_present}            sub="this week" />
                        <StatCard label="Total hours"   value={summary.total_hours.toFixed(1)}  sub="this week" />
                        <StatCard label="Late arrivals" value={summary.late_arrivals}            sub={`after ${workStart}`} />
                    </section>
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
