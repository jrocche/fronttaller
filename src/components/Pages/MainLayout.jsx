import PropTypes from "prop-types";
import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

function MainLayout({ children }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible); // Alterna la visibilidad de la barra lateral
  };

  const handleLogout = () => {
    console.log("Cerrando sesión...");
    window.location.href = "/"; // Redirige al login
    localStorage.removeItem("token")
  };

  return (
    <div className="app-container">
      {/* Header con botón para alternar la barra lateral */}
      <Header onLogout={handleLogout} onToggleSidebar={toggleSidebar} />
      
      {/* Barra lateral, visible o no según el estado */}
      <Sidebar visible={sidebarVisible} />

      {/* Contenido principal */}
      <div className={`content ${sidebarVisible ? 'shifted' : ''}`}>
        {children}
      </div>
    </div>
  );
}

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MainLayout;
