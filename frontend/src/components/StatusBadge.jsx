const STATUS = {
    on_time: ['On time', 'badge-ok'],
    late:    ['Late',    'badge-late'],
    absent:  ['Absent',  'badge-absent'],
    pending: ['Not yet', 'badge-muted']
}

export default function StatusBadge({ status }) {
    const [text, cls] = STATUS[status] || ['Not yet', 'badge-muted']
    return <span className={`badge ${cls}`}>{text}</span>
}
