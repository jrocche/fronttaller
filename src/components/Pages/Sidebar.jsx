import PropTypes from "prop-types";
import "../styles/sidebar.css";

function Sidebar({ visible }) {
  return (
    <div className={`sidebar ${visible ? "visible" : ""}`}>
      <ul className="menu">
        <div>
          <br/>
          <br/>
          <br/>
          <br/>
        </div>
        <li className="mod"><a href="./Inicio">Modulos</a></li>
        
        <li>
          <a href="#">Administracion De Taller</a>
          <ul className="submenu">
            <li><a href="./ListaOrdenes">Listas de ordenes</a></li>
          </ul>
        </li>
        <li>
          <a href="#">Usuarios</a>
          <ul className="submenu">
            <li><a href="./Usuario">Usuarios</a></li>
          </ul>
        </li>
        <li>
          <a href="#">Clientes</a>
          <ul className="submenu">
            <li><a href="./clientes">Listas De Clientes</a></li>
          </ul>
        </li>
        <li>
          <a href="#">Empleados</a>
          <ul className="submenu">
            <li><a href="./empleados">Lista De Empleados</a></li>
          </ul>
        </li>
        <li>
          <a href="#">Administracion de cotizaciones</a>
          <ul className="submenu">
            <li><a href="./ListaCotizaciones">Lista Cotizaciones</a></li>
          </ul>
        </li>
        <li>
          <a href="#">Administracion de servicios</a>
          <ul className="submenu">
            <li><a href="./categorias">Categorias</a></li>
          </ul>
        </li>
        
        <li>
          <a href="#">Administracion de herramientas</a>
          <ul className="submenu">
            <li><a href="./herramientas">herramientas</a></li>
          </ul>
        </li>
        <li>
          <a href="#">Reportes</a>
          <ul className="submenu">
           
            <li><a href="./reporte_cotizacion">Reporte de cotizaciones</a></li>    
             <li><a href="./ReporteOrdenes">Reporte de administracion de taller</a></li>
          
          </ul>
        </li>
        
      </ul>
    </div>
  );
}

Sidebar.propTypes = {
  visible: PropTypes.bool.isRequired,
};

export default Sidebar;