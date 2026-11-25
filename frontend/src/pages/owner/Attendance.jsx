import { useMemo, useState } from 'react'
import OwnerLayout  from '../../components/OwnerLayout'
import OwnerMessage from '../../components/OwnerMessage'
import { todayKey } from '../../sharedHelpers'

// 2.2.1 daily attendance view
import { AttendanceHeader, AttendanceFilters, AttendanceTable, buildDailyRows, useAttendanceData }
    from '../../components/DailyAttendanceView'
// 2.2.2 attendance summary and status
import { AttendanceSummaryCards, summarize } from '../../components/AttendanceSummaryStatus'

export default function Attendance() {
    const [date, setDate]     = useState(todayKey())
    const [search, setSearch] = useState('')
    const { employees, records, error } = useAttendanceData()

    const rows    = useMemo(() => buildDailyRows(employees, records, date, search), [employees, records, date, search])
    const summary = summarize(rows)

    return (
        <OwnerLayout active="attendance">
            <AttendanceHeader />

            <OwnerMessage msg={error ? { text: error, ok: false } : null} />

            <AttendanceSummaryCards summary={summary} />

            <div className="em-card">
                <h2>Daily attendance</h2>
                <AttendanceFilters date={date} onDateChange={setDate} search={search} onSearchChange={setSearch} />
                <br />
                <AttendanceTable rows={rows} />
            </div>
        </OwnerLayout>
    )
}
