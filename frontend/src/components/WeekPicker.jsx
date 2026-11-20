const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function mondayOf(date) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    return d
}

function dateKey(d) {
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${d.getFullYear()}-${mm}-${dd}`
}

function weekLabel(monday) {
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    const from = `${MONTHS[monday.getMonth()]} ${monday.getDate()}`
    const to   = sunday.getMonth() === monday.getMonth()
        ? String(sunday.getDate())
        : `${MONTHS[sunday.getMonth()]} ${sunday.getDate()}`
    return `${from} to ${to}`
}

export function buildWeeks() {
    const weeks      = []
    const thisMonday = mondayOf(new Date())
    for (let i = 0; i < 12; i++) {
        const monday = new Date(thisMonday)
        monday.setDate(thisMonday.getDate() - i * 7)
        weeks.push({
            value: dateKey(monday),
            label: weekLabel(monday) + (i === 0 ? ' (this week)' : '')
        })
    }
    return weeks
}

export default function WeekPicker({ weeks, value, onChange }) {
    return (
        <div className="week-picker">
            <label htmlFor="weekSelect">Week</label>
            <select
                id="weekSelect"
                value={value}
                onChange={e => onChange(e.target.value)}
            >
                {weeks.map(w => (
                    <option key={w.value} value={w.value}>{w.label}</option>
                ))}
            </select>
        </div>
    )
}
