import { useRef, useState } from 'react'
import OwnerLayout  from '../../components/OwnerLayout'
import OwnerMessage from '../../components/OwnerMessage'

// 2.1.1 QR scan time in and time out
import { postScan, CameraScanner, ScanModeToggle, LastScanCard, TodayScansList, useTodayScans }
    from '../../components/ScanRecording'
// 2.1.2 scan rules and validation
import { DEFAULT_MODE, scanErrorMessage } from '../../components/ScanRules'
// 2.1.3 manual ID entry and undo
import { ManualIdEntry, UndoButton, useUndoScan } from '../../components/ManualIdUndo'

export default function ScanAttendance() {
    const [mode, setMode] = useState(DEFAULT_MODE)   // auto, in, or out
    const [msg, setMsg]   = useState(null)
    const [last, setLast] = useState(null)           // last recorded scan (for the card and Undo)

    const modeRef = useRef(DEFAULT_MODE)

    const { events, loadToday } = useTodayScans(setMsg)

    // Sends the QR text (or typed ID) to the backend, which records the time in or time out.
    async function recordScan(scanCode) {
        try {
            const result = await postScan(scanCode, modeRef.current)
            setMsg(null)
            setLast(result)
            loadToday()
        } catch (err) {
            setMsg(scanErrorMessage(err))
        }
    }

    function chooseMode(key) {
        modeRef.current = key
        setMode(key)
    }

    const handleUndo = useUndoScan(last, {
        onUndone:  () => { setLast(null); loadToday() },
        onMessage: setMsg
    })

    return (
        <OwnerLayout active="attendance">
            <h1>Scan attendance</h1>
            <p className="em-sub">Scan an employee's QR code to record their time in or time out</p>
            <OwnerMessage msg={msg} />

            <div className="em-row">
                {/* Camera */}
                <div className="em-card" style={{ flex: 2 }}>
                    <div className="em-card-head">
                        <h2>Camera</h2>
                        <ScanModeToggle mode={mode} onChange={chooseMode} />
                    </div>

                    <CameraScanner onScan={recordScan} />

                    <ManualIdEntry onRecord={recordScan} onError={setMsg} />
                </div>

                <div style={{ flex: 1 }}>
                    <LastScanCard last={last}>
                        <UndoButton onUndo={handleUndo} />
                    </LastScanCard>
                    <TodayScansList events={events} />
                </div>
            </div>
        </OwnerLayout>
    )
}
