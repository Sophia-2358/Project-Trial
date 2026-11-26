// Small coloured label. color: 'green' | 'amber' | 'red' | 'grey'
export default function OwnerPill({ color = 'grey', children, id }) {
    return <span id={id} className={`em-pill em-${color}`}>{children}</span>
}
