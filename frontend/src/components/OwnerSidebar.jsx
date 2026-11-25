import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'

const MENU = [
    { key: 'dashboard',        label: 'Dashboard',        to: '/owner/dashboard' },
    { key: 'customer-orders',  label: 'Customer orders',  to: '/owner/customer-orders' },
    { key: 'inquiries',        label: 'Inquiries',        to: '/owner/inquiries' },
    { key: 'sales-reports',    label: 'Sales reports',    to: '/owner/sales-reports' },
    { key: 'employee-payroll', label: 'Employee payroll', to: '/owner/employee-payroll' },
    { key: 'attendance',       label: 'Attendance',       to: '/owner/attendance' }
]

export default function OwnerSidebar({ active }) {
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
        <nav className="em-sidebar" aria-label="Owner pages">
            <img
                className="em-logo"
                src={logo}
                alt="A.S. De Leon Glass and Aluminum Fabrication"
            />

            {MENU.map(item => (
                <Link
                    key={item.key}
                    to={item.to}
                    className={active === item.key ? 'em-active' : undefined}
                    aria-current={active === item.key ? 'page' : undefined}
                >
                    {item.label}
                </Link>
            ))}

            <div className="em-bottom">
                <button type="button" className="em-linkbtn" onClick={handleLogout}>
                    Log out
                </button>
            </div>
        </nav>
    )
}
