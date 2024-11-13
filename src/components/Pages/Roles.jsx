import { useState, useEffect } from "react";
import MainLayout from "./MainLayout";
import "../styles/roles.css";

function Roles() {
  const [roles, setRoles] = useState([]);
  const [nuevoRol, setNuevoRol] = useState({ nombre: "", descripcion: "" });
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEditar, setModoEditar] = useState(false);
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  const URL = import.meta.env.VITE_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    obtenerRoles();
  }, []);

  const obtenerRoles = () => {
    fetch(`${URL}roles`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setRoles(data))
      .catch((error) => console.error("Error al obtener roles:", error));
  };

  const handleInputChange = (e) => {
    setNuevoRol({
      ...nuevoRol,
      [e.target.name]: e.target.value,
    });
  };

  const crearRol = (e) => {
    e.preventDefault();
    fetch(`${URL}roles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(nuevoRol),
    })
      .then((response) => response.json())
      .then(() => {
        obtenerRoles();
        setNuevoRol({ nombre: "", descripcion: "" });
        setMostrarModal(false);
      })
      .catch((error) => console.error("Error al crear rol:", error));
  };

  const eliminarRol = (id) => {
    fetch(`${URL}roles/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => obtenerRoles())
      .catch((error) => console.error("Error al eliminar rol:", error));
  };

  const seleccionarRol = (rol) => {
    setModoEditar(true);
    setRolSeleccionado(rol);
    setNuevoRol({
      nombre: rol.nombre,
      descripcion: rol.descripcion,
    });
    setMostrarModal(true);
  };

  const actualizarRol = (e) => {
    e.preventDefault();
    fetch(`${URL}roles/${rolSeleccionado.id_rol}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(nuevoRol),
    })
      .then((response) => response.json())
      .then(() => {
        obtenerRoles();
        setModoEditar(false);
        setMostrarModal(false);
        setNuevoRol({ nombre: "", descripcion: "" });
      })
      .catch((error) => console.error("Error al actualizar rol:", error));
  };

  return (
    <MainLayout>
      <div className="roles-container">
        <div className="roles-header">
          <h2>Gestión de Roles</h2>
          <button onClick={() => setMostrarModal(true)} className="nuevo-rol-btn">
            + Nuevo Rol
          </button>
        </div>

        <table className="tabla-roles">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((rol) => (
              <tr key={rol.id_rol}>
                <td>{rol.id_rol}</td>
                <td>{rol.nombre}</td>
                <td>{rol.descripcion}</td>
                <td>
                  <button onClick={() => seleccionarRol(rol)} className="editar-btn">
                    Editar
                  </button>
                  <button onClick={() => eliminarRol(rol.id_rol)} className="eliminar-btn">
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
              <h3>{modoEditar ? "Editar Rol" : "Nuevo Rol"}</h3>
              <form onSubmit={modoEditar ? actualizarRol : crearRol}>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre del rol"
                  value={nuevoRol.nombre}
                  onChange={handleInputChange}
                  required
                />
                <textarea
                  name="descripcion"
                  placeholder="Descripción del rol"
                  value={nuevoRol.descripcion}
                  onChange={handleInputChange}
                  required
                ></textarea>
                <div className="modal-buttons">
                  <button type="button" onClick={() => setMostrarModal(false)} className="cancelar-btn">
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
      </div>
    </MainLayout>
  );
}

export default Roles;