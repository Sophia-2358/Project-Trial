// Helpers shared by the Owner pages.

// Calls the backend and returns the parsed JSON. Throws an Error with the
// server's message when the request fails.
export async function api(url, { method = 'GET', body } = {}) {
    const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body:    body ? JSON.stringify(body) : undefined
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Something went wrong. Please try again.')
    }
    return data
}

export function dateKey(d) {
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${d.getFullYear()}-${mm}-${dd}`
}

// Today's date as 2026-10-19 (local time).
export function todayKey() {
    return dateKey(new Date())
}

// Turns a date from the backend (ISO text or Date) into 2026-10-19 (local time).
export function toDateKey(value) {
    if (!value) return ''
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value
    return dateKey(new Date(value))
}

// Turns a date/time from the backend into '7:58 AM'. Empty values show a dash.
export function formatClock(value) {
    if (!value) return '—'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return '—'
    const h = d.getHours()
    const m = String(d.getMinutes()).padStart(2, '0')
    return `${((h + 11) % 12) + 1}:${m} ${h < 12 ? 'AM' : 'PM'}`
}
