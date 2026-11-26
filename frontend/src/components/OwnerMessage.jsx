// Green (ok) or red (error) message bar. Pass msg = { text, ok } or null to hide it.
export default function OwnerMessage({ msg, id }) {
    const cls = msg ? (msg.ok ? 'em-msg em-ok' : 'em-msg em-error') : 'em-msg'
    return (
        <div id={id} className={cls} role={msg && !msg.ok ? 'alert' : 'status'}>
            {msg ? msg.text : ''}
        </div>
    )
}
