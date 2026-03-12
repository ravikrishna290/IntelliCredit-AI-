import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout() {
    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <Sidebar />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Header />

                <main style={{ flex: 1, overflowY: 'auto', padding: '2rem', position: 'relative' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
