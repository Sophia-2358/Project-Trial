import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function EmployeeSidebar({ userName, activePage }) {
    const navigate = useNavigate()

    async function handleLogout() {
        try {
            await fetch('/api/auth/logout', {
                method:      'POST',
                credentials: 'include',
                headers:     { 'Content-Type': 'application/json' }
            })
        } catch {
            // leave the page anyway
        }
        navigate('/login')
    }

    return (
        <aside className="sidebar">
            <header className="logo">
                <Link to="/">
                    <img className="logo-img" src={logo} alt="A.S. De Leon, back to home" />
                </Link>
            </header>

            <nav className="menu" aria-label="Employee pages">
                <Link
                    className={`menu-link${activePage === 'qr' ? ' active' : ''}`}
                    to="/employee/qr"
                    aria-current={activePage === 'qr' ? 'page' : undefined}
                >
                    My QR code
                </Link>
                <Link
                    className={`menu-link${activePage === 'attendance' ? ' active' : ''}`}
                    to="/employee/attendance"
                    aria-current={activePage === 'attendance' ? 'page' : undefined}
                >
                    Attendance history
                </Link>
                <Link
                    className={`menu-link${activePage === 'deduction' ? ' active' : ''}`}
                    to="/employee/deduction"
                    aria-current={activePage === 'deduction' ? 'page' : undefined}
                >
                    Deduction
                </Link>
            </nav>

            <footer className="user-box">
                <p className="user-name">{userName || 'Loading...'}</p>
                <button type="button" className="logout" onClick={handleLogout}>
                    Log out
                </button>
            </footer>
        </aside>
    )
}
