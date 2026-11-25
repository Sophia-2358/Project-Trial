import { useCallback, useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import OwnerPill from './OwnerPill'
import { api, todayKey, toDateKey, formatClock } from '../sharedHelpers'
import { scanStatusText } from './ScanRules'          // 2.1.2
import '../styles/scanRecording.css'

// ==========================================
// 2.1.1 — Implement QR scan time in and time out (frontend)
// ==========================================

// Sends the QR text (or typed ID) to the backend, which records the time in or
// time out. Returns the result: { type, employee, time, status, hours, ... }
export async function postScan(code, mode) {
    const res = await api('/api/attendance-scan', {
        method: 'POST',
        body:   { code, mode }
    })
    return res.data
}

// Starts the camera QR reader inside the element with id `elementId`.
// Calls onScan(text) once per scan: the camera reads the same code many times a
// second, so while it stays in view (and for 3 seconds after) it counts as one scan.
function useQrScanner(elementId, onScan) {
    const lastResultRef = useRef(null)   // the last QR text that was read
    const lastTimeRef   = useRef(0)      // when it was last seen
    const onScanRef     = useRef(onScan) // always points to the newest onScan

    useEffect(() => { onScanRef.current = onScan })

    useEffect(() => {
        let scanner = null

        function onScanSuccess(decodedText) {
            const now = Date.now()
            const sameCode = decodedText === lastResultRef.current && now - lastTimeRef.current < 3000
            lastResultRef.current = decodedText
            lastTimeRef.current   = now
            if (sameCode) return

            onScanRef.current(decodedText)
        }

        // Created on the next tick so React StrictMode's double mount doesn't start two cameras.
        const timer = setTimeout(() => {
            scanner = new Html5QrcodeScanner(
                elementId,
                { fps: 10, qrbox: 250, showTorchButtonIfSupported: true },
                false
            )
            scanner.render(onScanSuccess, () => {})
        }, 0)

        return () => {
            clearTimeout(timer)
            if (scanner) scanner.clear().catch(() => {})
        }
    }, [elementId])
}

// The camera QR reader and its instruction text.
export function CameraScanner({ onScan }) {
    useQrScanner('qr-reader', onScan)

    return (
        <>
            <div id="qr-reader"></div>
            <p className="em-muted">Point the camera at the employee's QR code and hold it inside the frame. It records automatically.</p>
        </>
    )
}

const MODES = [
    { key: 'auto', label: 'Auto' },
    { key: 'in',   label: 'Time in' },
    { key: 'out',  label: 'Time out' }
]

// Auto / Time in / Time out toggle.
export function ScanModeToggle({ mode, onChange }) {
    return (
        <div className="em-toggle">
            {MODES.map(m => (
                <button
                    key={m.key}
                    type="button"
                    className={mode === m.key ? 'em-active' : undefined}
                    onClick={() => onChange(m.key)}
                >
                    {m.label}
                </button>
            ))}
        </div>
    )
}

// "Last scan" card: name, position, ID, time and On time / Late (or hours worked).
// Anything passed as children (the Undo button) is shown under the details.
export function LastScanCard({ last, children }) {
    return (
        <div className="em-card">
            <h2>Last scan</h2>
            {!last ? (
                <p className="em-muted">No scan yet.</p>
            ) : (
                <div>
                    <div className="em-who">
                        <div className="em-check">✓</div>
                        <div>
                            <div className="em-name">{last.employee.full_name}</div>
                            <div className="em-muted">
                                {last.employee.position} · {last.employee.employee_code}
                            </div>
                        </div>
                    </div>
                    <p>
                        <OwnerPill color={last.type === 'in' ? 'green' : 'grey'}>
                            {last.type === 'in' ? 'Timed in' : 'Timed out'}
                        </OwnerPill>{' '}
                        <strong>
                            {formatClock(last.time)} · {scanStatusText(last)}
                        </strong>
                    </p>
                    {children}
                </div>
            )}
        </div>
    )
}

// Lists every time in and time out recorded today, newest first.
// onError({ text, ok }) is called if loading fails.
export function useTodayScans(onError) {
    const [events, setEvents] = useState([])

    const loadToday = useCallback(async () => {
        try {
            const res = await api('/api/attendance')
            const today = todayKey()
            const list = []
            ;(res.data || []).filter(r => toDateKey(r.work_date) === today).forEach(r => {
                if (r.time_in)  list.push({ id: `${r.id}-in`,  name: r.full_name, type: 'Time in',  time: r.time_in })
                if (r.time_out) list.push({ id: `${r.id}-out`, name: r.full_name, type: 'Time out', time: r.time_out })
            })
            list.sort((a, b) => new Date(b.time) - new Date(a.time))
            setEvents(list)
        } catch (err) {
            onError({ text: err.message, ok: false })
        }
    }, [onError])

    useEffect(() => { loadToday() }, [loadToday])

    return { events, loadToday }
}

// "Scanned today" card: today's scans, newest first.
export function TodayScansList({ events }) {
    return (
        <div className="em-card">
            <h2>Scanned today</h2>
            <div>
                {events.length === 0 ? (
                    <p className="em-muted">No scans yet today.</p>
                ) : events.map(ev => (
                    <div className="em-event" key={ev.id}>
                        <span>{ev.name}</span>
                        <OwnerPill color={ev.type === 'Time in' ? 'green' : 'grey'}>{ev.type}</OwnerPill>
                        <strong>{formatClock(ev.time)}</strong>
                    </div>
                ))}
            </div>
        </div>
    )
}
