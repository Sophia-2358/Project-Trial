import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OwnerSidebar from './OwnerSidebar'
import '../styles/employeeManagement.css'

// Wraps every Owner page: checks that an owner is logged in, then shows the
// sidebar on the left and the page on the right.
export default function OwnerLayout({ active, children }) {
    const navigate = useNavigate()
    const [allowed, setAllowed] = useState(false)

    useEffect(() => {
        let cancelled = false

        async function checkSession() {
            try {
                const res  = await fetch('/api/auth/me', { credentials: 'include' })
                const data = await res.json().catch(() => ({}))
                if (!res.ok || !data.user || data.user.role !== 'owner') {
                    navigate('/login')
                    return
                }
                if (!cancelled) setAllowed(true)
            } catch {
                navigate('/login')
            }
        }

        checkSession()
        return () => { cancelled = true }
    }, [navigate])

    if (!allowed) return null

    return (
        <div className="em-app">
            <OwnerSidebar active={active} />
            <main>{children}</main>
        </div>
    )
}
