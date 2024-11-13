import '../styles/inicio.css'; // Estilos específicos para la página de inicio
import LogoInicio from '../../assets/carro.jpg';
import { useNavigate } from 'react-router-dom';

function Inicio() {
  const token = localStorage.getItem("token"); // Corregido el acceso a localStorage
  const navigate = useNavigate();

  if (!token) {
    navigate("/login");
  }

  return (
    <div className='cont'>
      <br/>
      <br/>
      <br/>
      <div className="inicio-container">      
        <img src={LogoInicio} className='inicio' alt="logo de inicio" />      
        <h2>SISTEMA DEL TALLER DE ENDEREZADO Y PINTURA GUZMAN</h2>
        <p>Reparación y pintura de calidad garantizada.</p>
      </div>
    </div>
  );
}

export default Inicio;
