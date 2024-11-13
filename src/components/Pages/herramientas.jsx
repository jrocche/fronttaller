import { useState, useEffect } from "react";
import "../styles/herramientas.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Herramientas = () => {
  const [herramientas, setHerramientas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [herramientaSeleccionada, setHerramientaSeleccionada] = useState(null);
  const token = localStorage.getItem("token");
  const URL = import.meta.env.VITE_URL;

  const [nuevaHerramienta, setNuevaHerramienta] = useState({
    nombre: "",
    descripcion: "",
    cantidad: "",
    estado: "operativa",
    fecha_adquisicion: "",
    precio: "",
    responsable: "",
    observaciones: "",
  });

  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [historialHerramienta, setHistorialHerramienta] = useState(null);

  const fetchHerramientas = async (mostrarToast = false) => {
    try {
      const response = await fetch(`${URL}herramientas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Error al cargar las herramientas");
      }
      const data = await response.json();
      setHerramientas(data);
      if (mostrarToast) {
        toast.success("Herramientas cargadas exitosamente");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar las herramientas");
    }
  };

  useEffect(() => {
    fetchHerramientas(false); // No mostrar toast al cargar inicialmente
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevaHerramienta((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = modoEdicion
        ? `${URL}herramientas/${herramientaSeleccionada}`
        : `${URL}herramientas`;

      const datosParaEnviar = {
        nombre: nuevaHerramienta.nombre,
        descripcion: nuevaHerramienta.descripcion,
        cantidad: parseInt(nuevaHerramienta.cantidad),
        estado: nuevaHerramienta.estado,
        fecha_adquisicion: nuevaHerramienta.fecha_adquisicion,
        precio: parseFloat(nuevaHerramienta.precio),
        responsable: nuevaHerramienta.responsable,
      };

      const response = await fetch(url, {
        method: modoEdicion ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datosParaEnviar),
      });

      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message;
        } catch {
          errorMessage = "Error al procesar la respuesta del servidor";
        }
        throw new Error(
          errorMessage || `Error ${response.status}: ${response.statusText}`
        );
      }

      await fetchHerramientas(true); // Mostrar toast después de la operación
      handleCloseModal();
      toast.success(
        modoEdicion
          ? "Herramienta actualizada con éxito"
          : "Herramienta creada con éxito"
      );
    } catch (error) {
      console.error("Error al guardar herramienta:", error);
      toast.error("Error al guardar la herramienta: " + error.message);
    }
  };

  const handleEdit = (herramienta) => {
    setHerramientaSeleccionada(herramienta.id_herramienta);
    setNuevaHerramienta({
      nombre: herramienta.nombre || "",
      descripcion: herramienta.descripcion || "",
      cantidad: herramienta.cantidad?.toString() || "",
      estado: herramienta.estado || "operativa",
      fecha_adquisicion: herramienta.fecha_adquisicion || "",
      precio: herramienta.precio?.toString() || "",
      responsable: herramienta.responsable || "",
    });
    setModoEdicion(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro que desea eliminar esta herramienta?")) {
      try {
        const response = await fetch(`${URL}herramientas/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Error al eliminar la herramienta"
          );
        }

        await fetchHerramientas(true); // Mostrar toast después de la eliminación
        toast.success("Herramienta eliminada con éxito");
      } catch (error) {
        console.error("Error al eliminar herramienta:", error);
        toast.error("Error al eliminar la herramienta: " + error.message);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModoEdicion(false);
    setHerramientaSeleccionada(null);
    setNuevaHerramienta({
      nombre: "",
      descripcion: "",
      cantidad: "",
      estado: "operativa",
      fecha_adquisicion: "",
      precio: "",
      responsable: "",
    });
  };

  const handleVerHistorial = async (id) => {
    try {
      const response = await fetch(`${URL}herramientas/${id}/historial`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al cargar el historial");
      }

      const data = await response.json();
      setHistorialHerramienta(data);
      setShowHistorialModal(true);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar el historial");
    }
  };

  const handleEstadoChange = (e) => {
    const nuevoEstado = e.target.value;
    setNuevaHerramienta(prev => ({
      ...prev,
      estado: nuevoEstado,
      observaciones: `Cambio de estado a ${nuevoEstado}`
    }));
  };

  return (
    <div className="taller-container">
      <div className="taller-header">
        <h2>Inventario de Herramientas</h2>
        <button className="btn-nueva" onClick={() => setShowModal(true)}>
          Nueva Herramienta
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">
              {modoEdicion ? "Editar Herramienta" : "Nueva Herramienta"}
            </h2>
            <form onSubmit={handleSubmit} className="herramienta-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="nombre">Nombre</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={nuevaHerramienta.nombre}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cantidad">Cantidad</label>
                  <input
                    type="number"
                    id="cantidad"
                    name="cantidad"
                    value={nuevaHerramienta.cantidad}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="estado">Estado</label>
                  <select
                    id="estado"
                    name="estado"
                    value={nuevaHerramienta.estado}
                    onChange={handleEstadoChange}
                    required
                  >
                    <option value="operativa">Operativa</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="desechada">Desechada</option>
                  </select>
                </div>

                {modoEdicion && nuevaHerramienta.estado !== herramientaSeleccionada?.estado && (
                  <div className="form-group">
                    <label htmlFor="observaciones">Observaciones del cambio de estado</label>
                    <textarea
                      id="observaciones"
                      name="observaciones"
                      value={nuevaHerramienta.observaciones}
                      onChange={handleInputChange}
                      placeholder="Ingrese las observaciones sobre el cambio de estado"
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="fecha_adquisicion">Fecha de Adquisición</label>
                  <input
                    type="date"
                    id="fecha_adquisicion"
                    name="fecha_adquisicion"
                    value={nuevaHerramienta.fecha_adquisicion}
                    onChange={handleInputChange}
                    required={!modoEdicion}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="precio">Precio</label>
                  <input
                    type="number"
                    id="precio"
                    name="precio"
                    step="0.01"
                    value={nuevaHerramienta.precio}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="responsable">Responsable</label>
                  <input
                    type="text"
                    id="responsable"
                    name="responsable"
                    value={nuevaHerramienta.responsable}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={nuevaHerramienta.descripcion}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-buttons">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={handleCloseModal}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  {modoEdicion ? "Guardar Cambios" : "Crear Herramienta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="herramientas-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Cantidad</th>
              <th>Estado</th>
              <th>Fecha Adquisición</th>
              <th>Precio</th>
              <th>Responsable</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {herramientas.map((herramienta) => (
              <tr key={herramienta.id_herramienta}>
                <td>{herramienta.nombre}</td>
                <td>{herramienta.descripcion}</td>
                <td>{herramienta.cantidad}</td>
                <td>
                  <span className={`estado ${herramienta.estado}`}>
                    {herramienta.estado}
                  </span>
                </td>
                <td>{herramienta.fecha_adquisicion}</td>
                <td>Q{herramienta.precio}</td>
                <td>{herramienta.responsable}</td>
                <td>
                  <button
                    onClick={() => handleEdit(herramienta)}
                    className="btn-editar"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(herramienta.id_herramienta)}
                    className="btn-eliminar"
                  >
                    Eliminar
                  </button>
                  <button
                    onClick={() => handleVerHistorial(herramienta.id_herramienta)}
                    className="btn-historial"
                  >
                    Ver Historial
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
      {showHistorialModal && historialHerramienta && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">
              Historial de {historialHerramienta.herramienta.nombre}
            </h2>
            <div className="historial-container">
              <div className="detalles-herramienta">
                <h3>Detalles actuales</h3>
                <p><strong>Estado actual:</strong> {historialHerramienta.herramienta.estado}</p>
                <p><strong>Cantidad:</strong> {historialHerramienta.herramienta.cantidad}</p>
                <p><strong>Responsable:</strong> {historialHerramienta.herramienta.responsable}</p>
              </div>
              
              <div className="historial-lista">
                <h3>Historial de cambios</h3>
                {historialHerramienta.historial.length > 0 ? (
                  <table className="historial-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Estado Anterior</th>
                        <th>Nuevo Estado</th>
                        <th>Responsable</th>
                        <th>Observaciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historialHerramienta.historial.map((registro, index) => (
                        <tr key={index}>
                          <td>{new Date(registro.fecha_cambio).toLocaleDateString()}</td>
                          <td>
                            <span className={`estado ${registro.estado_anterior}`}>
                              {registro.estado_anterior}
                            </span>
                          </td>
                          <td>
                            <span className={`estado ${registro.estado_nuevo}`}>
                              {registro.estado_nuevo}
                            </span>
                          </td>
                          <td>{registro.usuario_responsable}</td>
                          <td>{registro.observaciones}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No hay registros de cambios</p>
                )}
              </div>
            </div>
            <div className="form-buttons">
              <button
                type="button"
                className="btn-cancelar"
                onClick={() => setShowHistorialModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Herramientas;