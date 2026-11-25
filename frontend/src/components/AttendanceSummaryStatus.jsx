import OwnerPill from './OwnerPill'
import OwnerStatCard from './OwnerStatCard'
import '../styles/attendanceSummaryStatus.css'

// ==========================================
// 2.2.2 — Implement attendance summary and status (frontend)
// ==========================================

// Pill colour of each status label.
const PILL = {
    'On time': 'green',
    'Late':    'amber',
    'Absent':  'red'
}

// Absent if there is no time in, Late if the time in is after 8:00 AM
// (the backend saves it as status 'late'), On time otherwise.
export function getStatus(attendance) {
    if (!attendance) return 'Absent'
    return attendance.status === 'late' ? 'Late' : 'On time'
}

// Counts for the cards, from the rows of the chosen date.
export function summarize(rows) {
    return {
        total:    rows.length,
        present:  rows.filter(r => r.time_in).length,
        late:     rows.filter(r => r.status === 'Late').length,
        notIn:    rows.filter(r => r.status === 'Absent').length,
        timedOut: rows.filter(r => r.time_out).length
    }
}

// Present today (out of total), Late, Not yet in, Timed out.
export function AttendanceSummaryCards({ summary }) {
    return (
        <div className="em-stats">
            <OwnerStatCard label="Present today" value={summary.present}  sub={`of ${summary.total} employees`} />
            <OwnerStatCard label="Late"          value={summary.late}     sub="after 8:00 AM" />
            <OwnerStatCard label="Not yet in"    value={summary.notIn}    sub="no scan so far" />
            <OwnerStatCard label="Timed out"     value={summary.timedOut} sub="finished for the day" />
        </div>
    )
}

// Coloured status label: On time (green), Late (amber), Absent (red).
export function StatusPill({ status }) {
    return <OwnerPill color={PILL[status]}>{status}</OwnerPill>
}
