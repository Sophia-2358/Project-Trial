import { useState } from 'react'
import { api } from '../sharedHelpers'

// ==========================================
// 2.1.3 — Implement manual ID entry and undo scan (frontend)
// ==========================================

// "Enter ID instead" button that opens an Employee ID field with a Record button.
// onRecord(id) records it like a QR scan. onError({ text, ok }) shows the empty-field error.
export function ManualIdEntry({ onRecord, onError }) {
    const [showId, setShowId] = useState(false)
    const [code, setCode]     = useState('')

    function handleIdSubmit(e) {
        e.preventDefault()
        const value = code.trim()
        if (!value) return onError({ text: 'Enter the employee ID.', ok: false })
        onRecord(value)
        setCode('')
    }

    return (
        <>
            <button type="button" className="em-light" onClick={() => setShowId(v => !v)}>
                Enter ID instead
            </button>
            {showId && (
                <form onSubmit={handleIdSubmit}>
                    <label htmlFor="employee_code">Employee ID</label>
                    <div className="em-row">
                        <input id="employee_code" name="employee_code" autoFocus
                               value={code} onChange={e => setCode(e.target.value)} />
                        <button>Record</button>
                    </div>
                </form>
            )}
        </>
    )
}

// Undo button for the "Last scan" card.
export function UndoButton({ onUndo }) {
    return <button type="button" className="em-light" onClick={onUndo}>Undo</button>
}

// Removes the last time in or time out of the employee in `last` (the Last scan result).
async function undoLastScan(last) {
    await api('/api/attendance-scan/undo', {
        method: 'POST',
        body:   { user_id: last.employee.id, type: last.type }
    })
}

// Returns handleUndo for the Undo button.
// onUndone() runs after a successful undo, onMessage({ text, ok }) shows the result.
export function useUndoScan(last, { onUndone, onMessage }) {
    return async function handleUndo() {
        if (!last) return
        try {
            await undoLastScan(last)
            onUndone()
            onMessage({ text: 'Last scan undone.', ok: true })
        } catch (err) {
            onMessage({ text: err.message, ok: false })
        }
    }
}
