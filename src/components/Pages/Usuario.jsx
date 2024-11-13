import { useState, useEffect } from "react";
import MainLayout from "./MainLayout";
import "../styles/usuario.css"; // Estilos específicos
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Usuario() {
  const [usuarios, setUsuarios] = useState([]);
 
  const URL = import.meta.env.VITE_URL;
  const token = localStorage.getItem("token");

  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    email: "",
    contrasenia: "",
    telefono: "",
    direccion: "",
    dpi: "", // Nuevo campo DPI
    fecha_inicio_labores: "", // Nuevo campo fecha de inicio de labores
    activo: true,
  });
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEditar, setModoEditar] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  useEffect(() => {
    obtenerUsuarios();
    
  }, );

  const obtenerUsuarios = () => {
    fetch(`${URL}usuarios`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error en la respuesta del servidor');
        }
        return response.json();
      })
      .then((data) => {
        setUsuarios(data);
        // Remover el toast de éxito al cargar usuarios para evitar spam
      })
      .catch((error) => {
        console.error("Error al obtener usuarios:", error);
        toast.error("Error al cargar los usuarios");
      });
  };


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNuevoUsuario({
      ...nuevoUsuario,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const crearUsuario = (e) => {
    e.preventDefault();
    fetch(`${URL}usuarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(nuevoUsuario),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error al crear el usuario');
        }
        return response.json();
      })
      .then(() => {
        obtenerUsuarios();
        setNuevoUsuario({
          nombre: "",
          email: "",
          contrasenia: "",
          telefono: "",
          direccion: "",
          dpi: "", // Nuevo campo DPI
          fecha_inicio_labores: "", // Nuevo campo fecha de inicio de labores
          activo: true,
        });
        setMostrarModal(false);
        toast.success("Usuario creado exitosamente");
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error(error.message);
      });
  };

  const eliminarUsuario = (id) => {
    if (window.confirm("¿Está seguro que desea eliminar este usuario?")) {
      fetch(`${URL}usuarios/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Error al eliminar el usuario');
          }
          obtenerUsuarios();
          toast.success("Usuario eliminado exitosamente");
        })
        .catch((error) => {
          console.error("Error:", error);
          toast.error(error.message);
        });
    }
  };

  const seleccionarUsuario = (usuario) => {
    setModoEditar(true);
    setUsuarioSeleccionado(usuario);
    setNuevoUsuario({
      nombre: usuario.nombre,
      email: usuario.email,
      contrasenia: usuario.contrasenia,
      telefono: usuario.telefono,
      direccion: usuario.direccion,
      dpi: usuario.dpi,
      fecha_inicio_labores: usuario.fecha_inicio_labores,
      activo: usuario.activo, // Asegúrate de incluir el estado activo aquí
    });
    setMostrarModal(true);
  };

  const actualizarUsuario = (e) => {
    e.preventDefault();
    fetch(`${URL}usuarios/${usuarioSeleccionado.id_usuario}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(nuevoUsuario),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error al actualizar el usuario');
        }
        return response.json();
      })
      .then(() => {
        obtenerUsuarios();
        setModoEditar(false);
        setMostrarModal(false);
        setNuevoUsuario({ nombre: "", email: "", contrasenia: "", telefono:"", direccion: "", fecha_inicio_labores:"", activo: true });
        toast.success("Usuario actualizado exitosamente");
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error(error.message);
      });
  };

  return (
    <MainLayout>
      <div>
        <br />
        <br />
        <br />
        <br />
      </div>
      <div className="usuario-header">
        <div className="nombre-pagina">Gestión de Usuarios</div>
       
        <button
          onClick={() => setMostrarModal(true)}
          className="nuevo-usuario-btn"
        >
          + Nuevo Usuario
        </button>
      </div>

      <table className="tabla-usuarios">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Telefono</th>
            <th>Direccion</th>
            <th>Dpi</th>
            <th>Fecha Inicio Labores</th>
        
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id_usuario}>
              <td>{usuario.id_usuario}</td>
              <td>{usuario.nombre}</td>
              <td>{usuario.email}</td>
              <td>{usuario.telefono}</td>
              <td>{usuario.direccion}</td>
              <td>{usuario.dpi}</td>
              <td>{new Date(usuario.fecha_inicio_labores).toLocaleDateString()}</td>
              
              <td>
                <span
                  className={`estado ${usuario.activo ? "activo" : "inactivo"}`}
                >
                  {usuario.activo ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td>
                <button
                  onClick={() => seleccionarUsuario(usuario)}
                  className="editar-btn"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminarUsuario(usuario.id_usuario)}
                  className="eliminar-btn"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {mostrarModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{modoEditar ? "Actualizar Usuario" : "Nuevo Usuario"}</h3>
            <form onSubmit={modoEditar ? actualizarUsuario : crearUsuario}>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={nuevoUsuario.nombre}
                onChange={handleInputChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={nuevoUsuario.email}
                onChange={handleInputChange}
                required
              />
              <input
                type="password"
                name="contrasenia"
                placeholder="Contraseña"
                value={nuevoUsuario.contrasenia}
                onChange={handleInputChange}
                required
              />

<input
                type="text"
                name="telefono"
                placeholder="telefono"
                value={nuevoUsuario.telefono}
                onChange={handleInputChange}
                required
              />
 <input
                type="text"
                name="direccion"
                placeholder="direccion"
                value={nuevoUsuario.direccion}
                onChange={handleInputChange}
                required
              />


             <input
             
    type="text"
    name="dpi"
    placeholder="DPI"
    value={nuevoUsuario.dpi}
    onChange={handleInputChange}
    required
/>
<input
    type="date"
    name="fecha_inicio_labores"
    placeholder="Fecha de Inicio de Labores"
    value={nuevoUsuario.fecha_inicio_labores}
    onChange={handleInputChange}
    required
/>
               
          
              <label>
                <input
                  type="checkbox"
                  name="activo"
                  checked={nuevoUsuario.activo}
                  onChange={handleInputChange}
                />
                Activo
              </label>
              <div className="modal-buttons">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="cancelar-btn"
                >
                  Cancelar
                </button>
                <button type="submit" className="guardar-btn">
                  {modoEditar ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
        
      )}
       <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </MainLayout>
  );
}

export default Usuario;