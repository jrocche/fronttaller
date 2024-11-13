import { useState, useEffect, useCallback } from 'react';
import MainLayout from './MainLayout';
import '../styles/listaCotizaciones.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/cotizacionForm.css';

function ListaCotizaciones() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [filteredCotizaciones, setFilteredCotizaciones] = useState([]);
  const URL = import.meta.env.VITE_URL;
  const token = localStorage.getItem("token");
  const [servicios, setServicios] = useState([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [clientes, setClientes] = useState([]);

  const [nuevaCotizacion, setNuevaCotizacion] = useState({
    id_cliente: "",
    nombre_cliente: "",
    servicios: [],
    servicios_detalle: "[]",
    fecha: "",
    hora: "",
    estado: "Pendiente",
    tipo_cliente: "Cliente",
    precio: 0
  });

  // Añadir este useEffect para cargar los clientes
  useEffect(() => {
    const obtenerClientes = async () => {
      try {
        const response = await fetch(`${URL}clientes`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Error al obtener clientes');
        const data = await response.json();
        setClientes(data);
      } catch (error) {
        console.error("Error al obtener clientes:", error);
      }
    };
    obtenerClientes();
  }, [URL, token]);

  // Añadir este useEffect para cargar los servicios
  useEffect(() => {
    const cargarDatos = async () => {
        try {
            // Primero cargar servicios
            const respServicios = await fetch(`${URL}servicios`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const serviciosData = await respServicios.json();
            setServicios(serviciosData);

            // Luego cargar cotizaciones
            const respCotizaciones = await fetch(`${URL}cotizaciones`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const cotizacionesData = await respCotizaciones.json();
            
            // Formatear las cotizaciones con la información de servicios
            const cotizacionesFormateadas = cotizacionesData.map(cotizacion => {
                let serviciosInfo = [];
                try {
                    serviciosInfo = typeof cotizacion.servicios_detalle === 'string' 
                        ? JSON.parse(cotizacion.servicios_detalle) 
                        : (cotizacion.servicios_detalle || []);
                } catch (error) {
                    console.error('Error al parsear servicios:', error);
                }

                return {
                    ...cotizacion,
                    servicios: serviciosInfo,
                    precio: parseFloat(cotizacion.precio) || 0
                };
            });

            setCotizaciones(cotizacionesFormateadas);
            setFilteredCotizaciones(cotizacionesFormateadas);
        } catch (error) {
            console.error("Error al cargar datos:", error);
            toast.error("Error al cargar los datos");
        }
    };

    cargarDatos();
}, []);

  const [filtros, setFiltros] = useState({
    fecha: '',
    cliente: ''
  });

  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEditar, setModoEditar] = useState(false);
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null);
  const [mostrarCarnet, setMostrarCarnet] = useState(false);

  const aplicarFiltros = useCallback(() => {
    let resultado = [...cotizaciones];

    if (filtros.fecha) {
        // Convertir la fecha del filtro a formato YYYY-MM-DD
        const fechaFiltro = new Date(filtros.fecha).toISOString().split('T')[0];
        
        resultado = resultado.filter(cotizacion => {
            // Convertir la fecha de la cotización al mismo formato
            const fechaCotizacion = new Date(cotizacion.fecha).toISOString().split('T')[0];
            return fechaCotizacion === fechaFiltro;
        });
    }

    if (filtros.cliente && filtros.cliente.trim() !== '') {
        resultado = resultado.filter(cotizacion => 
            cotizacion.nombre_cliente && 
            cotizacion.nombre_cliente.toLowerCase().includes(filtros.cliente.toLowerCase().trim())
        );
    }

    setFilteredCotizaciones(resultado);
}, [cotizaciones, filtros]);

  const obtenerCotizaciones = useCallback(async (mostrarToast = false) => {
    try {
      const response = await fetch(`${URL}cotizaciones`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en la respuesta del servidor');
      }
      
      const data = await response.json();
      const cotizacionesFormateadas = data.map(cotizacion => ({
        ...cotizacion,
        precio: typeof cotizacion.precio === 'string' ? 
                    parseFloat(cotizacion.precio.replace(/[^0-9.-]+/g, "")) : 
                    parseFloat(cotizacion.precio) || 0
      }));
      setCotizaciones(cotizacionesFormateadas);
      setFilteredCotizaciones(cotizacionesFormateadas);
      
      if (mostrarToast) {
        toast.success("Cotizaciones cargadas exitosamente");
      }
    } catch (error) {
      console.error("Error al obtener cotizaciones:", error);
      toast.error(`Error al cargar las cotizaciones: ${error.message}`);
    }
  }, [URL, token]);

  // Fetch cotizaciones on component mount
  useEffect(() => {
    obtenerCotizaciones(false);
  }, [obtenerCotizaciones]);

  // Apply filters whenever cotizaciones or filtros change
  useEffect(() => {
    aplicarFiltros();
  }, [aplicarFiltros]);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
        ...prev,
        [name]: value.trim()
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevaCotizacion(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServicioChange = (e) => {
    const servicioId = parseInt(e.target.value);
    if (!servicioId) return;

    const servicioSeleccionado = servicios.find(s => s.id_servicio === servicioId);
    if (!servicioSeleccionado) return;

    setServiciosSeleccionados(prev => {
        // Verificar si el servicio ya está seleccionado
        if (prev.some(s => s.id_servicio === servicioId)) {
            toast.warning("Este servicio ya está seleccionado");
            return prev;
        }

        const nuevoServicio = {
            id_servicio: servicioSeleccionado.id_servicio,
            nombre: servicioSeleccionado.nombre,
            descripcion: servicioSeleccionado.descripcion,
            precio: parseFloat(servicioSeleccionado.precio)
        };

        const nuevosServicios = [...prev, nuevoServicio];
        const precioTotal = nuevosServicios.reduce((total, serv) => total + serv.precio, 0);

        setNuevaCotizacion(prev => ({
            ...prev,
            precio: precioTotal,
            servicios_detalle: JSON.stringify(nuevosServicios)
        }));

        return nuevosServicios;
    });
  };

  const handleClienteChange = (e) => {
    const clienteId = e.target.value;
    const clienteSeleccionado = clientes.find(c => c.id_cliente === parseInt(clienteId));
    
    if (clienteSeleccionado) {
      setNuevaCotizacion(prev => ({
        ...prev,
        id_cliente: clienteSeleccionado.id_cliente,
        nombre_cliente: clienteSeleccionado.nombre
      }));
    }
  };

  const guardarCotizacion = async (e) => {
    e.preventDefault();
    try {
        const cotizacionData = {
            ...nuevaCotizacion,
            servicios_detalle: JSON.stringify(serviciosSeleccionados),
            precio: serviciosSeleccionados.reduce((total, servicio) => total + servicio.precio, 0)
        };

        const response = await fetch(`${URL}cotizaciones`, {
            method: modoEditar ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(cotizacionData)
        });

        if (!response.ok) {
            throw new Error('Error al procesar la cotización');
        }

        await obtenerCotizaciones();
        setMostrarModal(false);
        limpiarFormulario();
        toast.success(modoEditar ? "Cotización actualizada exitosamente" : "Cotización creada exitosamente");
    } catch (error) {
        console.error("Error:", error);
        toast.error("Error al procesar la cotización");
    }
};

  const seleccionarCotizacion = (cotizacion) => {
    setCotizacionSeleccionada(cotizacion);
    setNuevaCotizacion({ ...cotizacion });
    setModoEditar(true);
    setMostrarModal(true);
  };

  const actualizarCotizacion = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${URL}cotizaciones/${cotizacionSeleccionada.id_cotizacion}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nuevaCotizacion),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la cotización');
      }

      await obtenerCotizaciones();
      setModoEditar(false);
      setMostrarModal(false);
      setNuevaCotizacion({
        id_cliente: "",
        nombre_cliente: "",
        servicios: [],
        fecha: "",
        hora: "",
        estado: "Pendiente",
        tipo_cliente: "Cliente",
        precio: 0
      });
      toast.success("Cotización actualizada exitosamente");
    } catch (error) {
      console.error("Error al actualizar cotización:", error);
      toast.error("Error al actualizar la cotización");
    }
  };

  const eliminarCotizacion = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta cotización?')) {
      try {
        const response = await fetch(`${URL}cotizaciones/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error al eliminar la cotización');
        }

        await obtenerCotizaciones();
        toast.success("Cotización eliminada exitosamente");
      } catch (error) {
        console.error("Error al eliminar cotización:", error);
        toast.error("Error al eliminar la cotización");
      }
    }
  };

  // Agregar botón para limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
        fecha: '',
        cliente: ''
    });
  };

  const eliminarServicio = (index) => {
    const servicioEliminado = serviciosSeleccionados[index];
    setServiciosSeleccionados(prev => prev.filter((_, i) => i !== index));
    setNuevaCotizacion(prev => ({
        ...prev,
        precio: prev.precio - parseFloat(servicioEliminado.precio)
    }));
};

  const handleOpenModal = (cotizacion = null) => {
    if (cotizacion) {
      setModoEditar(true);
      setCotizacionSeleccionada(cotizacion);
      setNuevaCotizacion({
        // ... datos de la cotización ...
      });
      // Si la cotización tiene servicios_detalle, los cargamos
      setServiciosSeleccionados(cotizacion.servicios_detalle ? JSON.parse(cotizacion.servicios_detalle) : []);
    } else {
      setModoEditar(false);
      setCotizacionSeleccionada(null);
      setNuevaCotizacion({
        id_cliente: "",
        nombre_cliente: "",
        servicios: [],
        fecha: "",
        hora: "",
        estado: "Pendiente",
        tipo_cliente: "Cliente",
        precio: 0
      });
      setServiciosSeleccionados([]); // Reiniciar servicios seleccionados
    }
    setMostrarModal(true);
  };

  const verCarnet = (cotizacion) => {
    let serviciosParaMostrar = [];
    
    try {
        if (cotizacion.servicios_detalle) {
            serviciosParaMostrar = typeof cotizacion.servicios_detalle === 'string' 
                ? JSON.parse(cotizacion.servicios_detalle) 
                : cotizacion.servicios_detalle;
        } else if (cotizacion.servicios && Array.isArray(cotizacion.servicios)) {
            serviciosParaMostrar = cotizacion.servicios;
        } else {
            // Si no hay servicios_detalle ni servicios, crear un array con el servicio principal
            serviciosParaMostrar = [{
                nombre: cotizacion.servicio || 'Servicio no especificado',
                precio: cotizacion.precio || 0,
                descripcion: cotizacion.descripcion_servicio || ''
            }];
        }
    } catch (error) {
        console.error('Error al procesar servicios:', error);
        serviciosParaMostrar = [];
    }

    setCotizacionSeleccionada({
        ...cotizacion,
        servicios_formateados: serviciosParaMostrar
    });
    setMostrarCarnet(true);
  };

  const limpiarFormulario = () => {
    setNuevaCotizacion({
        id_cliente: "",
        nombre_cliente: "",
        servicios: [],
        fecha: "",
        hora: "",
        estado: "Pendiente",
        tipo_cliente: "Cliente",
        precio: 0
    });
    setServiciosSeleccionados([]);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    limpiarFormulario();
  };

  return (
    <MainLayout>
      <div>
      <div className="listacoti"> </div>
      <div className="lista-cotizaciones">
        <h1>Lista de Cotizaciones</h1>
        <button className="btn-nueva" onClick={() => handleOpenModal()}>
          Nueva Cotización
        </button>

        <div className="filtros">
          <div className="filtro-grupo">
              <label>Filtrar por fecha:</label>
              <input
                  type="date"
                  name="fecha"
                  value={filtros.fecha}
                  onChange={handleFiltroChange}
              />
          </div>
          <div className="filtro-grupo">
              <label>Filtrar por cliente:</label>
              <input
                  type="text"
                  name="cliente"
                  value={filtros.cliente}
                  onChange={handleFiltroChange}
                  placeholder="Nombre del cliente"
              />
          </div>
          <button 
              onClick={limpiarFiltros}
              className="btn-limpiar-filtros"
          >
              Limpiar Filtros
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Servicio</th>
              <th>Descripción</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Precio Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredCotizaciones.map((cotizacion) => {
                let serviciosInfo = [];
                try {
                    serviciosInfo = typeof cotizacion.servicios_detalle === 'string' 
                        ? JSON.parse(cotizacion.servicios_detalle) 
                        : (cotizacion.servicios_detalle || []);
                } catch (error) {
                    console.error('Error al parsear servicios:', error);
                    serviciosInfo = [];
                }

                // Obtener el primer servicio
                const primerServicio = serviciosInfo[0] || {};

                return (
                    
                    <tr key={cotizacion.id_cotizacion}>
                        <td>{cotizacion.id_cotizacion}</td>
                        <td>{cotizacion.nombre_cliente}</td>
                        <td>{primerServicio.nombre || 'Sin servicio'}</td>
                        <td>{primerServicio.descripcion || '-'}</td>
                        <td>{new Date(cotizacion.fecha).toLocaleDateString()}</td>
                        <td>{cotizacion.estado}</td>
                        <td>Q{parseFloat(cotizacion.precio).toFixed(2)}</td>
                        <td>
                            <div className="acciones-grupo">
                                <button onClick={() => seleccionarCotizacion(cotizacion)}>✏️</button>
                                <button onClick={() => verCarnet(cotizacion)}>👁️</button>
                                <button onClick={() => eliminarCotizacion(cotizacion.id_cotizacion)}>🗑️</button>
                            </div>
                        </td>
                    </tr>
                );
            })}
          </tbody>
        </table>

        {mostrarModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <form onSubmit={modoEditar ? actualizarCotizacion : guardarCotizacion}>
                <div className="form-group">
                    <label>Cliente</label>
                    <select
                        name="id_cliente"
                        value={nuevaCotizacion.id_cliente}
                        onChange={handleClienteChange}
                        required
                    >
                        <option value="">Seleccione un cliente</option>
                        {clientes.map(cliente => (
                            <option 
                                key={cliente.id_cliente} 
                                value={cliente.id_cliente}
                            >
                                {cliente.nombre} - {cliente.dpi}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Servicios:</label>
                    <select 
                        value="" 
                        onChange={handleServicioChange}
                        className="form-control"
                    >
                        <option value="">Seleccione un servicio</option>
                        {servicios.map(servicio => (
                            <option key={servicio.id_servicio} value={servicio.id_servicio}>
                                {servicio.nombre} - Q{parseFloat(servicio.precio).toFixed(2)}
                            </option>
                        ))}
                    </select>

                    {/* Lista de servicios seleccionados */}
                    <div className="servicios-seleccionados">
                        {serviciosSeleccionados.map((servicio, index) => (
                            <div key={index} className="servicio-item">
                                <span>{servicio.nombre} - Q{servicio.precio.toFixed(2)}</span>
                                <button 
                                    type="button" 
                                    onClick={() => eliminarServicio(index)}
                                    className="btn-eliminar-servicio"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <input
                    type="date"
                    name="fecha"
                    value={nuevaCotizacion.fecha}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="time"
                    name="hora"
                    value={nuevaCotizacion.hora}
                    onChange={handleInputChange}
                    required
                />
                <select
                    name="estado"
                    value={nuevaCotizacion.estado}
                    onChange={handleInputChange}
                >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Aprobada">Aprobada</option>
                    <option value="Rechazada">Rechazada</option>
                </select>
                <select
                    name="tipo_cliente"
                    value={nuevaCotizacion.tipo_cliente}
                    onChange={handleInputChange}
                >
                    <option value="Cliente">Cliente</option>
                    <option value="Particular">Particular</option>
                </select>
                <input
                    type="numeric"
                    step="0.01"
                    name="precio"
                    placeholder="Precio"
                    value={nuevaCotizacion.precio}
                    readOnly
                />
                <div className="modal-buttons">
                    <button 
                        type="button" 
                        className="btn-cancelar" 
                        onClick={cerrarModal}
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

        {mostrarCarnet && cotizacionSeleccionada && (
          <div className="modal-overlay">
            <div className="carnet-detalle">
                <h2>Detalle de Cotización</h2>
                <div className="carnet-contenido">
                    <div className="carnet-campo">
                        <strong>N° Cotización:</strong>
                        <span>{cotizacionSeleccionada.id_cotizacion}</span>
                    </div>
                    <div className="carnet-campo">
                        <strong>Cliente:</strong>
                        <span>{cotizacionSeleccionada.nombre_cliente}</span>
                    </div>
                    <div className="carnet-campo">
                        <strong>Servicios:</strong>
                        <div className="carnet-servicios">
                            {cotizacionSeleccionada.servicios_formateados?.map((servicio, index) => (
                                <div key={index} className="carnet-servicio-item">
                                    <div className="servicio-header">
                                        <span className="servicio-nombre">{servicio.nombre}</span>
                                        <span className="servicio-precio">Q{parseFloat(servicio.precio).toFixed(2)}</span>
                                    </div>
                                    {servicio.descripcion && (
                                        <div className="servicio-descripcion">
                                            {servicio.descripcion}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="carnet-campo">
                        <strong>Precio Total:</strong>
                        <span className="costo-total">Q{parseFloat(cotizacionSeleccionada.precio).toFixed(2)}</span>
                    </div>
                    <div className="carnet-campo">
                        <strong>Fecha:</strong>
                        <span>{new Date(cotizacionSeleccionada.fecha).toLocaleDateString()}</span>
                    </div>
                </div>
                <button onClick={() => setMostrarCarnet(false)}>Cerrar</button>
            </div>
        </div>
        )}
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
      </div> 
    </MainLayout>
    
  );
}

export default ListaCotizaciones;