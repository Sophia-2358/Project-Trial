import StatusBadge from './StatusBadge'

export default function RecordsTable({ days }) {
    return (
        <div className="table-wrap">
            <table className="records">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Time in</th>
                        <th>Time out</th>
                        <th>Hours</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {days.length === 0 ? (
                        <tr>
                            <td colSpan={5} style={{ textAlign: 'center', color: '#66718c' }}>
                                No records for this week.
                            </td>
                        </tr>
                    ) : days.map((day, i) => (
                        <tr key={i}>
                            <td>{day.label}</td>
                            <td>{day.time_in  || '—'}</td>
                            <td>{day.time_out || '—'}</td>
                            <td>{day.hours !== null ? day.hours.toFixed(1) : '—'}</td>
                            <td><StatusBadge status={day.status} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
