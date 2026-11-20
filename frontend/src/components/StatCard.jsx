export default function StatCard({ label, value, sub }) {
    return (
        <article className="stat">
            <p className="stat-label">{label}</p>
            <p className="stat-value">{value}</p>
            {sub && <p className="stat-sub">{sub}</p>}
        </article>
    )
}
