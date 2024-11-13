import { useState, useEffect } from 'react';
import MainLayout from './MainLayout';
import '../styles/ListaOrdenes.css'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/ordenForm.css';



function ListaOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const URL = import.meta.env.VITE_URL; 
  const token = localStorage.getItem("token");

  

const ESTADOS = {
    PENDIENTE: 'pendiente',
    EN_PROGRESO: 'en_progreso',
    COMPLETADO: 'completado'
  };

  const [servicios, setServicios] = useState([]); 
  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar servicios
        const responseServicios = await fetch(`${URL}servicios`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!responseServicios.ok) {
          throw new Error('Error al cargar servicios');
        }

        const dataServicios = await responseServicios.json();
        console.log('Servicios cargados:', dataServicios); // Para debugging
        setServicios(dataServicios);

        // Cargar clientes
        const responseClientes = await fetch(`${URL}clientes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const dataClientes = await responseClientes.json();
        setClientes(dataClientes);

        // Cargar empleados
        const responseEmpleados = await fetch(`${URL}api/empleados`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!responseEmpleados.ok) {
          throw new Error('Error al cargar empleados');
        }
        const dataEmpleados = await responseEmpleados.json();
        console.log('Empleados cargados:', dataEmpleados);
        setEmpleados(dataEmpleados);
      } catch (error) {
        console.error("Error al cargar empleados:", error);
      }
    };

    cargarDatos();
  }, [URL, token]);

  const [nuevoOrden, setNuevoOrden] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    estado: ESTADOS.PENDIENTE,
    costo_total: 0,
    prioridad: "Baja",
    modelovehiculo: "",
    modo_pago: "Efectivo",
    nombre_cliente: "",
    id_empleado: "",
    responsable: "",
    servicios: []
  });

  const actualizarCostoTotal = (servicios) => {
    return servicios.reduce((total, servicio) => total + parseFloat(servicio.precio || 0), 0);
  };

  const handleServicioChange = (e) => {
    const servicioId = e.target.value;
    if (!servicioId) return;

    const servicioSeleccionado = servicios.find(s => s.id_servicio === parseInt(servicioId));
    if (!servicioSeleccionado) return;

    if (nuevoOrden.servicios.length >= 3) {
        toast.warning("Máximo 3 servicios permitidos");
        return;
    }

    setNuevoOrden(prev => {
        const nuevosServicios = [...prev.servicios, servicioSeleccionado];
        const nuevoTotal = actualizarCostoTotal(nuevosServicios);
        
        return {
            ...prev,
            servicios: nuevosServicios,
            costo_total: nuevoTotal
        };
    });
  };

  const eliminarServicio = (index) => {
    setNuevoOrden(prev => {
        const nuevosServicios = prev.servicios.filter((_, i) => i !== index);
        const nuevoTotal = actualizarCostoTotal(nuevosServicios);
        
        return {
            ...prev,
            servicios: nuevosServicios,
            costo_total: nuevoTotal
        };
    });
  };

  const renderFormularioServicios = () => (
    <div className="orden-servicios-section">
      <h4>Servicios Seleccionados</h4>
      <div className="orden-servicios-list">
        {nuevoOrden.servicios.map((servicio, index) => (
          <div key={index} className="orden-servicio-item">
            <span>{servicio.nombre} - Q{servicio.precio}</span>
            <button 
              type="button" 
              onClick={() => eliminarServicio(index)}
              className="orden-remove-btn"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      
      <select
        onChange={handleServicioChange}
        value=""
        className="orden-select"
      >
        <option value="">Seleccionar servicio</option>
        {servicios.map(servicio => (
          <option 
            key={servicio.id_servicio} 
            value={servicio.id_servicio}
          >
            {servicio.nombre} - Q{servicio.precio}
          </option>
        ))}
      </select>
      
      <div className="orden-total">
        <h4>Costo Total: Q{nuevoOrden.costo_total}</h4>
      </div>
    </div>
  );

  const ESTADOS_DISPLAY = {
    'pendiente': 'Pendiente',
    'en_progreso': 'En Progreso',
    'completado': 'Completado'
  };


  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEditar, setModoEditar] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [mostrarCarnet, setMostrarCarnet] = useState(false);
  
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  useEffect(() => {
    obtenerOrdenes(false);
  }, []);

  const obtenerOrdenes = (mostrarToast = false) => {
    // Primero obtenemos los servicios
    fetch(`${URL}servicios`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((respServicios) => respServicios.json())
      .then((serviciosData) => {
        // Guardamos los servicios en el estado
        setServicios(serviciosData);
        
        // Luego obtenemos las órdenes
        fetch(`${URL}ordenes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            const ordenesFormateadas = data.map(orden => {
              // Buscamos el servicio correspondiente
              const servicioEncontrado = serviciosData.find(
                s => s.id_servicio === orden.id_servicio
              );

              // Aseguramos que el servicio tenga nombre
              const nombreServicio = orden.servicio || servicioEncontrado?.nombre || '-';
              
              return {
                ...orden,
                estado: orden.estado?.toLowerCase() || ESTADOS.PENDIENTE,
                servicio: nombreServicio, // Asignamos el nombre del servicio
                descripcion_servicio: orden.descripcion_servicio || servicioEncontrado?.descripcion || '-',
                costo_total: orden.costo_total || 0,
                prioridad: orden.prioridad || 'BAJA',
                modelovehiculo: orden.modelovehiculo || '-',
                modo_pago: orden.modo_pago || 'Efectivo',
                nombre_cliente: orden.nombre_cliente || '-',
                responsable: orden.responsable || '-'
              };
            });
            
            console.log('Órdenes formateadas:', ordenesFormateadas);
            setOrdenes(ordenesFormateadas);
            if (mostrarToast) {
              toast.success("Órdenes cargadas exitosamente");
            }
          });
      })
      .catch((error) => {
        console.error("Error al obtener datos:", error);
        toast.error("Error al cargar las órdenes");
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "responsable") {
      const empleadoSeleccionado = empleados.find(emp => emp.nombre === value);
      setNuevoOrden(prev => ({
        ...prev,
        responsable: value,
        id_empleado: empleadoSeleccionado?.id_empleado || ''
      }));
    } else {
      setNuevoOrden(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };


  const crearOrden = async (e) => {
    e.preventDefault();
    try {
        if (!nuevoOrden.fecha_inicio || !nuevoOrden.fecha_fin) {
            toast.error('Las fechas son requeridas');
            return;
        }

        // Preparar los servicios
        const serviciosParaEnviar = nuevoOrden.servicios.map(servicio => ({
            id_servicio: servicio.id_servicio,
            nombre: servicio.nombre,
            precio: parseFloat(servicio.precio)
        }));

        // Calcular el costo total
        const costoTotal = serviciosParaEnviar.reduce((total, servicio) => 
            total + (parseFloat(servicio.precio) || 0), 0);

        // Preparar el objeto de orden
        const ordenParaEnviar = {
            fecha_inicio: nuevoOrden.fecha_inicio,
            fecha_fin: nuevoOrden.fecha_fin,
            estado: nuevoOrden.estado.toLowerCase(),
            costo_total: costoTotal,
            prioridad: nuevoOrden.prioridad || 'Baja',
            modelovehiculo: nuevoOrden.modelovehiculo,
            modo_pago: nuevoOrden.modo_pago || 'Efectivo',
            nombre_cliente: nuevoOrden.nombre_cliente,
            id_empleado: nuevoOrden.id_empleado || null,
            responsable: nuevoOrden.responsable,
            servicio: serviciosParaEnviar[0]?.nombre || '',
            servicios: serviciosParaEnviar
        };

        console.log('Datos a enviar:', ordenParaEnviar); // Para debugging

        const response = await fetch(`${URL}ordenes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(ordenParaEnviar)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error en la respuesta del servidor');
        }

        await response.json();
        obtenerOrdenes();
        setMostrarModal(false);
        limpiarFormulario();
        toast.success('Orden creada exitosamente');
    } catch (error) {
        console.error('Error detallado:', error);
        toast.error(error.message || 'Error al crear la orden');
    }
};

const limpiarFormulario = () => {
    setNuevoOrden({
        fecha_inicio: "",
        fecha_fin: "",
        estado: ESTADOS.PENDIENTE,
        costo_total: 0,
        prioridad: "Baja",
        modelovehiculo: "",
        modo_pago: "Efectivo",
        nombre_cliente: "",
        id_empleado: "",
        responsable: "",
        servicios: []
    });
};

  const seleccionarOrden = (orden) => {
    setModoEditar(true);
    setOrdenSeleccionada(orden);
    setNuevoOrden({
      ...orden,
      servicios: orden.servicios || [],
      fecha_inicio: orden.fecha_inicio.split('T')[0],
      fecha_fin: orden.fecha_fin.split('T')[0],
      estado: orden.estado.toLowerCase(),
      costo_total: parseFloat(orden.costo_total)
    });
    setMostrarModal(true);
  };

  const actualizarOrden = async (e) => {
    e.preventDefault();
    try {
        // Asegurarse de que servicios existe y es un array
        const servicios = nuevoOrden.servicios || [];
        
        // Calcular el costo total de los servicios
        const costoTotal = servicios.reduce((total, servicio) => 
            total + (parseFloat(servicio.precio) || 0), 0);

        // Preparar el objeto de orden
        const ordenActualizada = {
            fecha_inicio: nuevoOrden.fecha_inicio,
            fecha_fin: nuevoOrden.fecha_fin,
            estado: nuevoOrden.estado.toLowerCase(),
            costo_total: costoTotal,
            prioridad: nuevoOrden.prioridad || 'Baja',
            modelovehiculo: nuevoOrden.modelovehiculo,
            modo_pago: nuevoOrden.modo_pago || 'Efectivo',
            nombre_cliente: nuevoOrden.nombre_cliente,
            id_empleado: nuevoOrden.id_empleado,
            responsable: nuevoOrden.responsable,
            servicio: servicios[0]?.nombre || '',
            servicios_detalle: JSON.stringify(servicios)
        };

        console.log('Datos a enviar:', ordenActualizada); // Para debugging

        const response = await fetch(`${URL}ordenes/${ordenSeleccionada.id_orden}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(ordenActualizada)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error al actualizar la orden');
        }

        obtenerOrdenes();
        setMostrarModal(false);
        toast.success("Orden actualizada exitosamente");
    } catch (error) {
        console.error("Error detallado:", error);
        toast.error(error.message || "Error al actualizar la orden");
    }
};

  const eliminarOrden = (id) => {
    if (window.confirm("¿Está seguro que desea eliminar esta orden?")) {
      fetch(`${URL}ordenes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(() => {
          obtenerOrdenes();
          toast.success("Orden eliminada exitosamente");
        })
        .catch((error) => {
          console.error("Error al eliminar orden:", error);
          toast.error("Error al eliminar la orden");
        });
    }
  };

  const verCarnet = (orden) => {
    let serviciosParaMostrar = [];
    
    try {
        // Si servicios_detalle ya es un objeto, no necesita ser parseado
        if (orden.servicios_detalle && typeof orden.servicios_detalle === 'string') {
            serviciosParaMostrar = JSON.parse(orden.servicios_detalle);
        } else if (orden.servicios_detalle && typeof orden.servicios_detalle === 'object') {
            serviciosParaMostrar = orden.servicios_detalle;
        } else if (orden.servicios && Array.isArray(orden.servicios)) {
            serviciosParaMostrar = orden.servicios;
        } else if (orden.servicio) {
            serviciosParaMostrar = [{
                nombre: orden.servicio,
                precio: orden.costo_total
            }];
        }
    } catch (error) {
        console.error('Error al procesar servicios:', error);
        serviciosParaMostrar = [{
            nombre: orden.servicio || 'Servicio no especificado',
            precio: orden.costo_total || 0
        }];
    }

    setOrdenSeleccionada({
        ...orden,
        servicios_formateados: serviciosParaMostrar
    });
    setMostrarCarnet(true);
  };



  const filtrarOrdenes = () => {
    return ordenes.filter(orden => {
      const estadoNormalizado = orden.estado?.toLowerCase();
      const estadoMostrado = ESTADOS_DISPLAY[estadoNormalizado] || 'Pendiente';
      
      const estadoValido = filtroEstado === "Todos" || estadoMostrado === filtroEstado;
      const dentroFechas = (!fechaInicio || new Date(orden.fecha_inicio) >= new Date(fechaInicio)) &&
                           (!fechaFin || new Date(orden.fecha_fin) <= new Date(fechaFin));
      const buscaCliente = orden.nombre_cliente.toLowerCase().includes(busqueda.toLowerCase());
      return estadoValido && dentroFechas && buscaCliente;
    });
  };

  return (
    <MainLayout>
      <div className="gestion-ordenes">
        <div className="gestion-header">
          <h2 className="gestion-titulo">Gestión de Órdenes</h2>
          
          <div className="filtros-seccion">
            <select 
              className="filtro-input"
              value={filtroEstado} 
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="Todos">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Progreso">En Progreso</option>
              <option value="Completado">Completado</option>
            </select>
            
            <input 
              type="text"
              className="filtro-input"
              placeholder="Buscar por cliente"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            
            <input 
              type="date"
              className="filtro-input"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
            
            <input 
              type="date"
              className="filtro-input"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
            
            <button 
              className="boton-accion boton-nuevo"
              onClick={() => setMostrarModal(true)}
            >
              + Nueva Orden
            </button>
          </div>
        </div>

        <div className="tabla-ordenes-container">
          <table className="tabla-ordenes">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Estado</th>
                <th>Servicio</th>
                <th>Costo Total</th>
                <th>Prioridad</th>
                <th>Vehículo</th>
                <th>Modo Pago</th>
                <th>Cliente</th>
                <th>Responsable</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrarOrdenes().map((orden) => (
                <tr key={orden.id_orden}>
                  <td>{orden.id_orden}</td>
                  <td>{new Date(orden.fecha_inicio).toLocaleDateString()}</td>
                  <td>{new Date(orden.fecha_fin).toLocaleDateString()}</td>
                  <td>{ESTADOS_DISPLAY[orden.estado] || 'Pendiente'}</td>
                  <td>{orden.servicios?.[0]?.nombre || orden.servicio || '-'}</td>
                  <td>Q{parseFloat(orden.costo_total).toFixed(2)}</td>
                  <td>{orden.prioridad}</td>
                  <td>{orden.modelovehiculo}</td>
                  <td>{orden.modo_pago}</td>
                  <td>{orden.nombre_cliente}</td>
                  <td>{orden.responsable || '-'}</td>
                  <td>
                    <div className="acciones-grupo">
                      <button 
                        className="boton-accion boton-editar"
                        onClick={() => seleccionarOrden(orden)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        className="boton-accion boton-ver"
                        onClick={() => verCarnet(orden)}
                        title="Ver detalles"
                      >
                        👁️
                      </button>
                      <button 
                        className="boton-accion boton-eliminar"
                        onClick={() => eliminarOrden(orden.id_orden)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {mostrarModal && (
          <div className="orden-modal-overlay">
            <div className="orden-modal-content">
              <h3 className="orden-title">
                {modoEditar ? "Actualizar Orden" : "Nueva Orden"}
              </h3>
              <form onSubmit={modoEditar ? actualizarOrden : crearOrden} className="orden-form">
                <div className="orden-form-group">
                  <label className="orden-label">Cliente</label>
                  <select
                    className="orden-select"
                    name="nombre_cliente"
                    value={nuevoOrden.nombre_cliente}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccione un cliente</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id_cliente} value={cliente.nombre}>
                        {cliente.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="orden-form-group">
                  <label className="orden-label">Modelo de Vehículo</label>
                  <input
                    type="text"
                    name="modelovehiculo"
                    className="orden-input"
                    value={nuevoOrden.modelovehiculo}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <select 
                  name="modo_pago" 
                  value={nuevoOrden.modo_pago} 
                  onChange={handleInputChange} 
                  required
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                </select>
                <input 
                  type="number" 
                  name="costo_total" 
                  placeholder="Costo Total" 
                  value={nuevoOrden.costo_total} 
                  onChange={handleInputChange} 
                  required 
                />
                <select name="prioridad" value={nuevoOrden.prioridad} onChange={handleInputChange} required>
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA">Media</option>
                  <option value="ALTA">Alta</option>
                </select>
                <input type="text" name="prioridad" placeholder="Prioridad" value={nuevoOrden.prioridad} onChange={handleInputChange} required />
                <input type="date" name="fecha_inicio" placeholder="Fecha de Inicio" value={nuevoOrden.fecha_inicio} onChange={handleInputChange} required />
                <input type="date" name="fecha_fin" placeholder="Fecha de Fin" value={nuevoOrden.fecha_fin} onChange={handleInputChange} required />
                <div className="form-group">
                  <label>Responsable</label>
                  <select
                    name="responsable"
                    value={nuevoOrden.responsable}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccione un responsable</option>
                    {empleados.map(empleado => (
                      <option 
                        key={empleado.id_empleado} 
                        value={empleado.nombre}
                      >
                        {empleado.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <select name="estado" value={nuevoOrden.estado} onChange={handleInputChange} required>
                  <option value={ESTADOS.PENDIENTE}>Pendiente</option>
                  <option value={ESTADOS.EN_PROGRESO}>En Progreso</option>
                  <option value={ESTADOS.COMPLETADO}>Completado</option>
                </select>
                {renderFormularioServicios()}
                <div className="orden-buttons">
                  <button 
                    type="button" 
                    onClick={() => setMostrarModal(false)} 
                    className="orden-cancel-btn"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="orden-submit-btn"
                  >
                    {modoEditar ? "Actualizar" : "Guardar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {mostrarCarnet && ordenSeleccionada && (
          <div className="orden-modal-overlay">
            <div className="orden-modal-content carnet">
              <h3 className="carnet-titulo">Detalles de la Orden</h3>
              <div className="carnet-contenido">
                <div className="carnet-campo">
                  <strong>N° Orden:</strong> 
                  <span>{ordenSeleccionada.id_orden}</span>
                </div>
                <div className="carnet-campo">
                  <strong>Cliente:</strong> 
                  <span>{ordenSeleccionada.nombre_cliente}</span>
                </div>
                <div className="carnet-campo">
                  <strong>Modelo de Vehículo:</strong> 
                  <span>{ordenSeleccionada.modelovehiculo}</span>
                </div>
                <div className="carnet-campo">
                  <strong>Servicios:</strong>
                  <div className="carnet-servicios">
                    {ordenSeleccionada.servicios_formateados?.map((servicio, index) => (
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
                  <strong>Modo de Pago:</strong> 
                  <span>{ordenSeleccionada.modo_pago}</span>
                </div>
                <div className="carnet-campo">
                  <strong>Costo Total:</strong> 
                  <span className="costo-total">Q{parseFloat(ordenSeleccionada.costo_total).toFixed(2)}</span>
                </div>
                <div className="carnet-campo">
                  <strong>Prioridad:</strong> 
                  <span>{ordenSeleccionada.prioridad}</span>
                </div>
                <div className="carnet-campo">
                  <strong>Fecha de Inicio:</strong> 
                  <span>{new Date(ordenSeleccionada.fecha_inicio).toLocaleDateString()}</span>
                </div>
                <div className="carnet-campo">
                  <strong>Fecha de Fin:</strong> 
                  <span>{new Date(ordenSeleccionada.fecha_fin).toLocaleDateString()}</span>
                </div>
                <div className="carnet-campo">
                  <strong>Estado:</strong> 
                  <span>{ESTADOS_DISPLAY[ordenSeleccionada.estado]}</span>
                </div>
                <div className="carnet-campo">
                  <strong>Responsable:</strong> 
                  <span>{ordenSeleccionada.responsable}</span>
                </div>
              </div>
              <button 
                onClick={() => setMostrarCarnet(false)} 
                className="carnet-cerrar-btn"
              >
                Cerrar
              </button>
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
    </MainLayout>
  );
}

export default ListaOrdenes;