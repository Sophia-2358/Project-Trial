import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Welcome    from './pages/Welcome'
import Login      from './pages/Login'
import Signup     from './pages/Signup'
import VerifyOtp  from './pages/VerifyOtp'
import QrCode     from './pages/employee/QrCode'
import Attendance from './pages/employee/Attendance'
import Deduction  from './pages/employee/Deduction'

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public */}
                <Route path="/"            element={<Welcome />} />
                <Route path="/login"       element={<Login />} />
                <Route path="/signup"      element={<Signup />} />
                <Route path="/verify-otp"  element={<VerifyOtp />} />

                {/* Employee */}
                <Route path="/employee/qr"        element={<QrCode />} />
                <Route path="/employee/attendance" element={<Attendance />} />
                <Route path="/employee/deduction"  element={<Deduction />} />

                {/* Owner — placeholder until owner pages are built */}
                <Route path="/owner/dashboard" element={<div style={{ padding: 40 }}>Owner dashboard — coming soon.</div>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}
