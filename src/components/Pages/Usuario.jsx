import { useState, useEffect } from "react";
import MainLayout from "./MainLayout";
import "../styles/usuario.css"; // Estilos específicos
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const initialUserState = {
  nombre: "",
  email: "",
  contrasenia: "",
  nuevaContrasenia: "",
  telefono: "",
  direccion: "",
  dpi: "",
  fecha_inicio_labores: "",
  activo: true,
  id_rol: null
};

function Usuario() {
  const [usuarios, setUsuarios] = useState([]);
 
  const URL = import.meta.env.VITE_URL;
  const token = localStorage.getItem("token");

  const [nuevoUsuario, setNuevoUsuario] = useState(initialUserState);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEditar, setModoEditar] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  useEffect(() => {
    obtenerUsuarios();
  }, []);

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
    let inputValue;
    
    if (type === "checkbox") {
      inputValue = checked;
      console.log('Checkbox cambiado a:', checked); // Para debugging
    } else if (type === "date") {
      inputValue = value || null;
    } else {
      inputValue = value || "";
    }
    
    console.log(`Campo ${name} cambiado a:`, inputValue); // Para debugging
    
    setNuevoUsuario(prev => ({
      ...prev,
      [name]: inputValue
    }));
  };

  const crearUsuario = (e) => {
    e.preventDefault();
    
    // Asegurarse de que el campo activo refleje exactamente el estado del checkbox
    const usuarioData = {
      ...nuevoUsuario,
      activo: Boolean(nuevoUsuario.activo) // Convertir explícitamente a booleano
    };

    console.log('Estado activo antes de enviar:', usuarioData.activo); // Para debugging

    fetch(`${URL}usuarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(usuarioData),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al crear el usuario');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Respuesta del servidor:', data); // Para debugging
        obtenerUsuarios();
        setNuevoUsuario(initialUserState);
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
      nombre: usuario.nombre || "",
      email: usuario.email || "",
      nuevaContrasenia: "",
      telefono: usuario.telefono || "",
      direccion: usuario.direccion || "",
      dpi: usuario.dpi || "",
      fecha_inicio_labores: usuario.fecha_inicio_labores ? 
        new Date(usuario.fecha_inicio_labores).toISOString().split('T')[0] : "",
      activo: usuario.activo ?? true,
      id_rol: usuario.id_rol || null
    });
    setMostrarModal(true);
  };

  const actualizarUsuario = async (e) => {
    e.preventDefault();
    
    try {
      // Validación del token
      if (!token) {
        toast.error('No hay token de autenticación');
        return;
      }

      // Validación del ID de usuario
      if (!usuarioSeleccionado?.id_usuario) {
        toast.error('ID de usuario no válido');
        return;
      }

      // Validaciones de campos requeridos
      if (!nuevoUsuario.nombre?.trim() || !nuevoUsuario.email?.trim()) {
        toast.error('Nombre y email son campos requeridos');
        return;
      }

      const usuarioActualizado = {
        nombre: nuevoUsuario.nombre.trim(),
        email: nuevoUsuario.email.trim(),
        telefono: nuevoUsuario.telefono?.trim() || null,
        direccion: nuevoUsuario.direccion?.trim() || null,
        dpi: nuevoUsuario.dpi?.trim() || null,
        fecha_inicio_labores: nuevoUsuario.fecha_inicio_labores || null,
        activo: nuevoUsuario.activo,
        id_rol: nuevoUsuario.id_rol || null
      };

      if (nuevoUsuario.nuevaContrasenia?.trim()) {
        usuarioActualizado.nuevaContrasenia = nuevoUsuario.nuevaContrasenia.trim();
      }

      console.log('Enviando datos:', {
        url: `${URL}usuarios/${usuarioSeleccionado.id_usuario}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: usuarioActualizado
      });

      const response = await fetch(`${URL}usuarios/${usuarioSeleccionado.id_usuario}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(usuarioActualizado)
      });

      // Manejo específico de errores HTTP
      if (response.status === 401) {
        throw new Error('Sesión expirada. Por favor, vuelva a iniciar sesión.');
      }
      
      if (response.status === 403) {
        throw new Error('No tiene permisos para realizar esta acción.');
      }
      
      if (response.status === 404) {
        throw new Error('Usuario no encontrado.');
      }

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al actualizar el usuario');
        } else {
          const errorText = await response.text();
          console.error('Respuesta no JSON del servidor:', errorText);
          throw new Error('Error en la comunicación con el servidor');
        }
      }

      const data = await response.json();
      console.log('Respuesta del servidor:', data);

      if (!data.success) {
        throw new Error(data.message || 'Error al actualizar el usuario');
      }

      await obtenerUsuarios();
      setModoEditar(false);
      setMostrarModal(false);
      setNuevoUsuario(initialUserState);
      toast.success(data.message || "Usuario actualizado exitosamente");
      
    } catch (error) {
      console.error("Error detallado:", error);
      
      // Manejo específico de errores de red
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        toast.error('Error de conexión. Por favor, verifique su conexión a internet.');
        return;
      }
      
      toast.error(error.message || "Error al actualizar el usuario");
    }
  };

  const abrirModalNuevoUsuario = () => {
    setModoEditar(false);
    setUsuarioSeleccionado(null);
    setNuevoUsuario(initialUserState);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setModoEditar(false);
    setUsuarioSeleccionado(null);
    setNuevoUsuario(initialUserState);
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
          onClick={abrirModalNuevoUsuario}
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
                  className={`estado ${usuario.activo === true ? "activo" : "inactivo"}`}
                >
                  {usuario.activo === true ? "Activo" : "Inactivo"}
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
              {modoEditar ? (
                <input
                  type="password"
                  name="nuevaContrasenia"
                  placeholder="Nueva contraseña (opcional)"
                  value={nuevoUsuario.nuevaContrasenia || ""}
                  onChange={handleInputChange}
                />
              ) : (
                <input
                  type="password"
                  name="contrasenia"
                  placeholder="Contraseña"
                  value={nuevoUsuario.contrasenia || ""}
                  onChange={handleInputChange}
                  required
                />
              )}
              <input
                type="text"
                name="telefono"
                placeholder="Teléfono"
                value={nuevoUsuario.telefono}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="direccion"
                placeholder="Dirección"
                value={nuevoUsuario.direccion}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="dpi"
                placeholder="DPI"
                value={nuevoUsuario.dpi}
                onChange={handleInputChange}
              />
              <input
                type="date"
                name="fecha_inicio_labores"
                value={nuevoUsuario.fecha_inicio_labores}
                onChange={handleInputChange}
              />
              <label>
                <input
                  type="checkbox"
                  name="activo"
                  checked={Boolean(nuevoUsuario.activo)}
                  onChange={handleInputChange}
                />
                Activo
              </label>
              <div className="modal-buttons">
                <button
                  type="button"
                  onClick={cerrarModal}
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