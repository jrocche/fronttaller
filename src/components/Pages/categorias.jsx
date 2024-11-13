import { useState, useEffect } from 'react';
import MainLayout from './MainLayout';
import '../styles/categorias.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Categorias() {
  const [servicios, setServicios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingServicio, setEditingServicio] = useState(null);
  const URL = import.meta.env.VITE_URL;
  const token = localStorage.getItem("token");
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: ''
  });

  // Nueva variable de estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedServicios, setSelectedServicios] = useState([]);

  const handleServicioChange = (id_servicio) => {
    setSelectedServicios(prev => {
      if (prev.includes(id_servicio)) {
        return prev.filter(id => id !== id_servicio);
      } else if (prev.length < 3) {
        return [...prev, id_servicio];
      }
      return prev;
    });
  };

  const obtenerServicios = async () => {
    try {
      const response = await fetch(`${URL}servicios`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al obtener servicios');
      const data = await response.json();
      console.log('Servicios obtenidos:', data); // Para debugging
      setServicios(data);
      toast.success("Servicios cargados exitosamente"); // Notificación de éxito
    } catch (error) {
      console.error("Error al obtener servicios:", error);
      toast.error("Error al cargar los servicios"); // Notificación de error
    }
  };

  useEffect(() => {
    obtenerServicios();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Nueva función para manejar el cambio en el input de búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleOpenModal = (servicio = null) => {
    if (servicio) {
      setEditingServicio(servicio);
      setFormData({
        nombre: servicio.nombre,
        descripcion: servicio.descripcion,
        precio: servicio.precio
      });
    } else {
      setEditingServicio(null);
      setFormData({
        nombre: '',
        descripcion: '',
        precio: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingServicio(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const cotizacionData = {
      ...formData,
      servicios: selectedServicios // Enviar los servicios seleccionados
    };

    try {
      const endpoint = editingServicio 
        ? `${URL}servicios/${editingServicio.id_servicio}`
        : `${URL}servicios`;
      
      const method = editingServicio ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(cotizacionData)
      });

      if (!response.ok) {
        throw new Error(`Error al ${editingServicio ? 'actualizar' : 'crear'} servicio`);
      }

      await obtenerServicios(); // Recargar la lista de servicios
      handleCloseModal();
      toast.success(`Servicio ${editingServicio ? 'actualizado' : 'creado'} exitosamente`); // Notificación de éxito
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al guardar el servicio: " + error.message); // Notificación de error
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
      try {
        const response = await fetch(`${URL}servicios/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Error al eliminar servicio');
        await obtenerServicios(); // Recargar la lista después de eliminar
        toast.success("Servicio eliminado exitosamente"); // Notificación de éxito
      } catch (error) {
        console.error("Error al eliminar servicio:", error);
        toast.error("Error al eliminar el servicio: " + error.message); // Notificación de error
      }
    }
  };

  // Filtrar servicios por nombre
  const filteredServicios = servicios.filter(servicio =>
    servicio.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="categorias-container">
        <h1>Servicios</h1>
        
        <div className="header-container">
  <div className="buscador-container"> {/* Contenedor del buscador */}
    <input
      type="text"
      className="buscador-input" // Clase para el estilo del input
      placeholder="Buscar por nombre de servicio"
      value={searchTerm}
      onChange={handleSearchChange} // Manejar el cambio en el input de búsqueda
    />
    <button className="boton-busqueda" onClick={() => handleOpenModal()}> {/* Clase para el estilo del botón */}
      <i className="fas fa-plus"></i> Nuevo Servicio
    </button>
  </div>
</div>

        <div className="table-container">
          <table className="servicios-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredServicios.map((servicio) => ( // Usar servicios filtrados
                <tr key={servicio.id_servicio}>
                  <td>{servicio.id_servicio}</td>
                  <td>{servicio.nombre}</td>
                  <td>{servicio.descripcion}</td>
                  <td className="precio">Q{parseFloat(servicio.precio).toFixed(2)}</td> {/* Cambiar $ a Q */}
                  <td>
                    <button 
                      className="accion-btn editar"
                      onClick={() => handleOpenModal(servicio)}
                    >
                      <i className="fas fa-edit"></i> Editar
                    </button>
                    <button 
                      className="accion-btn eliminar"
                      onClick={() => handleDelete(servicio.id_servicio)}
                    >
                      <i className="fas fa-trash"></i> Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="servicios-selector">
          <h2>Seleccionar Servicios</h2>
          {servicios.map(servicio => (
            <div key={servicio.id_servicio}>
              <input
                type="checkbox"
                id={`servicio-${servicio.id_servicio}`}
                checked={selectedServicios.includes(servicio.id_servicio)}
                onChange={() => handleServicioChange(servicio.id_servicio)}
              />
              <label htmlFor={`servicio-${servicio.id_servicio}`}>{servicio.nombre} - Q{servicio.precio.toFixed(2)}</label>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>{editingServicio ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nombre:</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Descripción:</label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Precio:</label>
                  <input
                    type="number"
                    step="0.01"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="modal-buttons">
                  <button type="button" onClick={handleCloseModal}>
                    Cancelar
                  </button>
                  <button type="submit">
                    {editingServicio ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </form>
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

export default Categorias;