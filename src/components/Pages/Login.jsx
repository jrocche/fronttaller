import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import LogoTaller from '../../assets/logo1.png'; // Ruta del logo
import { useNavigate } from 'react-router-dom';

import "../styles/login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [contrasenia, setPassword] = useState("");
  const url = import.meta.env.VITE_URL;
  const navigate = useNavigate(); // Asegurarse de declarar useNavigate antes de su uso

  const onSubmitForm = async (e) => {
    e.preventDefault();
    try {
      const body = { email, contrasenia };

      const response = await fetch(`${url}login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const parseRes = await response.json();

      if (parseRes.token) {
        localStorage.setItem("token", parseRes.token);
        navigate("/inicio");
      } else {
        Swal.fire({
          imageUrl: "/src/assets/warning2.png",
          imageWidth: "auto",
          imageHeight: "300px",
          title: "Oops...",
          text: "¡Correo o contraseña incorrectos!",
          customClass: {
            confirmButton: "ok",
            cancelButton: "btCancelar",
            text: "texto-alerta",
            popup: "popup-alerta",
            title: "titulo-pop",
            container: "contA",
            image: "imagen-centrada",
          },
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [loading, setLoading] = useState(true); // Estado para la pantalla de carga

  useEffect(() => {
    // Simula un tiempo para mostrar el logo
    setTimeout(() => {
      setLoading(false); // Después de 3 segundos, desaparece la pantalla de carga y muestra el login
    }, 3000);
  }, []);

  return (
    <>
      {loading ? (
        // Pantalla de carga con el logo del taller
        <div className="loading-screen">
          <img src={LogoTaller} className="logo react" alt="Taller logo" />
          <h1>Cargando...</h1>
        </div>
      ) : (
        // Pantalla de Login cuando el logo desaparece
        <div className="login-container">
        <img src={LogoTaller} className='Tallerguzman' alt="Logo del taller" />
         
          <h2>Iniciar Sesión</h2>
          <form onSubmit={onSubmitForm}>
            <div className="form-group">
              <label htmlFor="email">Usuario:</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                required
              />
            </div>
            <div className="form-group">
                  

              <label htmlFor="contrasenia">Contraseña:</label>
              <input
                type="password"
                name="contrasenia"
                value={contrasenia}
                onChange={(e) => setPassword(e.target.value)}
                id="contrasenia"
                required
              />
            </div>
            <button className="BTenviar" id="btn-login" type="submit" onClick={onSubmitForm}>
              Ingresar
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default Login;
