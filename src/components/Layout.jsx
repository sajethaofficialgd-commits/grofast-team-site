import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import MobileHeader from './MobileHeader';

export default function Layout() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <MobileHeader />
            <Sidebar />
            <main className="page">
                <Outlet />
            </main>
            <MobileNav />
        </div>
    );
}
