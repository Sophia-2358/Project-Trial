// One summary card (big number with a label above and a note below).
export default function OwnerStatCard({ label, value, sub }) {
    return (
        <div className="em-card">
            <div className="em-muted">{label}</div>
            <div className="em-num">{value}</div>
            <div className="em-muted">{sub}</div>
        </div>
    )
}
