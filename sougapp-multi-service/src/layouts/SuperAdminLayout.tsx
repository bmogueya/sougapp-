import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

export function SuperAdminLayout() {
  return (
    <div className="min-h-screen bg-bg flex">
      <Sidebar />
      <div className="flex-1 flex flex-col ltr:ml-64 rtl:mr-64">
        <Header />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
