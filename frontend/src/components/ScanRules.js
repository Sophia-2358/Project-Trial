// ==========================================
// 2.1.2 — Implement attendance scan rules and validation (frontend)
// The rules are checked by the backend. This file holds what the page shows.
// ==========================================

// In Auto mode the first scan of the day is time in, the next is time out.
export const DEFAULT_MODE = 'auto'

// Text beside the time in the "Last scan" card:
// "Late" / "On time" for a time in, or the hours worked for a time out.
export function scanStatusText(last) {
    if (last.type === 'in') return last.status === 'late' ? 'Late' : 'On time'
    return `${Number(last.hours).toFixed(1)} hours`
}

// Unrecognized code, already timed in, no time in, already timed out, etc.
// come back from the backend as an error message. Show it in the red bar.
export function scanErrorMessage(err) {
    return { text: err.message, ok: false }
}
