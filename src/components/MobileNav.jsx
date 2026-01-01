import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    MessageCircle,
    ClipboardList,
    Calendar,
    UserCircle
} from 'lucide-react';

export default function MobileNav() {
    const navItems = [
        { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
        { icon: ClipboardList, label: 'Update', path: '/daily-update' },
        { icon: MessageCircle, label: 'Chat', path: '/chat' },
        { icon: Calendar, label: 'Meetings', path: '/meetings' },
        { icon: UserCircle, label: 'Profile', path: '/profile' },
    ];

    return (
        <nav className="mobile-nav">
            {navItems.map(item => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                        `mobile-nav-item ${isActive ? 'active' : ''}`
                    }
                >
                    <item.icon />
                    <span>{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
}
