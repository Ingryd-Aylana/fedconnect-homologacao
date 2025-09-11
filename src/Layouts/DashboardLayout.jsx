import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar/Navbar';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  // Sidebar começa aberta no desktop, fechada no mobile
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 650);

  // Atualiza quando a tela muda de tamanho
  useEffect(() => {
    function handleResize() {
      setSidebarOpen(window.innerWidth > 650);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="dashboard-layout">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className={`dashboard-content${sidebarOpen ? ' with-sidebar' : ''}`}>
        <Outlet context={{ withSidebar: sidebarOpen }} />
      </div>
    </div>
  );
};

export default DashboardLayout;
