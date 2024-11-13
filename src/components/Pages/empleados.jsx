import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/empleados.css';

const Empleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState(null);
  const [showDetalles, setShowDetalles] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    puesto: '',
    fecha_contratacion: '',
    salario: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Actualiza la URL base
  const API_URL = 'http://localhost:5000/api';

  // Obtener empleados
  const getEmpleados = async () => {
    try {
      console.log('Intentando obtener empleados...');
      const response = await axios.get(`${API_URL}/empleados`);
      console.log('Respuesta:', response.data);
      setEmpleados(response.data);
    } catch (error) {
      console.error('Error al obtener empleados:', error);
      if (error.response) {
        // El servidor respondió con un estado de error
        console.error('Respuesta del servidor:', error.response.data);
      } else if (error.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        console.error('No se recibió respuesta del servidor');
      } else {
        // Algo sucedió en la configuración de la solicitud
        console.error('Error de configuración:', error.message);
      }
    }
  };

  useEffect(() => {
    getEmpleados();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Crear o actualizar empleado
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(`${API_URL}/empleados/${selectedId}`, formData);
      } else {
        await axios.post(`${API_URL}/empleados`, formData);
      }
      getEmpleados();
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Eliminar empleado
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este empleado?')) {
      try {
        await axios.delete(`${API_URL}/empleados/${id}`);
        getEmpleados();
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  // Editar empleado
  const handleEdit = (empleado) => {
    setEditMode(true);
    setSelectedId(empleado.id_empleado);
    setFormData({
      nombre: empleado.nombre,
      telefono: empleado.telefono,
      email: empleado.email,
      direccion: empleado.direccion,
      puesto: empleado.puesto,
      fecha_contratacion: empleado.fecha_contratacion.split('T')[0],
      salario: empleado.salario
    });
    setShowForm(true);
  };

  // Ver detalles del empleado
  const handleViewDetails = (empleado) => {
    setSelectedEmpleado(empleado);
    setShowDetalles(true);
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      nombre: '',
      telefono: '',
      email: '',
      direccion: '',
      puesto: '',
      fecha_contratacion: '',
      salario: ''
    });
    setEditMode(false);
    setSelectedId(null);
  };

  return (
    <div className="emp-dashboard">
      <div className="emp-header">
        <h2 className="emp-title">Gestión de Empleados</h2>
        <button className="emp-add-button" onClick={() => setShowForm(true)}>
          Nuevo Empleado
        </button>
      </div>

      {/* Modal de Formulario */}
      {showForm && (
        <div className="emp-modal-overlay">
          <div className="emp-modal">
            <h3 className="emp-modal-title">
              {editMode ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}
            </h3>
            <form onSubmit={handleSubmit} className="emp-form">
              <input
                className="emp-input"
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
              <input
                className="emp-input"
                type="tel"
                name="telefono"
                placeholder="Teléfono"
                value={formData.telefono}
                onChange={handleChange}
              />
              <input
                className="emp-input"
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <textarea
                className="emp-input emp-textarea"
                name="direccion"
                placeholder="Dirección"
                value={formData.direccion}
                onChange={handleChange}
              />
              <input
                className="emp-input"
                type="text"
                name="puesto"
                placeholder="Puesto"
                value={formData.puesto}
                onChange={handleChange}
                required
              />
              <input
                className="emp-input"
                type="date"
                name="fecha_contratacion"
                value={formData.fecha_contratacion}
                onChange={handleChange}
                required
              />
              <input
                className="emp-input"
                type="number"
                name="salario"
                placeholder="Salario"
                value={formData.salario}
                onChange={handleChange}
                step="0.01"
              />
              <div className="emp-form-buttons">
                <button className="emp-submit-btn" type="submit">
                  {editMode ? 'Actualizar' : 'Registrar'}
                </button>
                <button 
                  className="emp-cancel-btn" 
                  type="button" 
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalles */}
      {showDetalles && selectedEmpleado && (
        <div className="emp-modal-overlay">
          <div className="emp-modal">
            <h3 className="emp-modal-title">Detalles del Empleado</h3>
            <div className="emp-details">
              <p className="emp-detail-item">
                <span className="emp-detail-label">Nombre:</span> 
                {selectedEmpleado.nombre}
              </p>
              <p className="emp-detail-item">
                <span className="emp-detail-label">Teléfono:</span> 
                {selectedEmpleado.telefono}
              </p>
              <p className="emp-detail-item">
                <span className="emp-detail-label">Email:</span> 
                {selectedEmpleado.email}
              </p>
              <p className="emp-detail-item">
                <span className="emp-detail-label">Dirección:</span> 
                {selectedEmpleado.direccion}
              </p>
              <p className="emp-detail-item">
                <span className="emp-detail-label">Puesto:</span> 
                {selectedEmpleado.puesto}
              </p>
              <p className="emp-detail-item">
                <span className="emp-detail-label">Fecha Contratación:</span> 
                {new Date(selectedEmpleado.fecha_contratacion).toLocaleDateString()}
              </p>
              <p className="emp-detail-item">
                <span className="emp-detail-label">Salario:</span> 
                ${selectedEmpleado.salario}
              </p>
            </div>
            <button 
              className="emp-close-btn"
              onClick={() => setShowDetalles(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Tabla de Empleados */}
      <div className="emp-table-container">
        <table className="emp-table">
          <thead>
            <tr>
              <th className="emp-th">Nombre</th>
              <th className="emp-th">Teléfono</th>
              <th className="emp-th">Email</th>
              <th className="emp-th">Puesto</th>
              <th className="emp-th">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleados.map((empleado) => (
              <tr key={empleado.id_empleado}>
                <td className="emp-td">{empleado.nombre}</td>
                <td className="emp-td">{empleado.telefono}</td>
                <td className="emp-td">{empleado.email}</td>
                <td className="emp-td">{empleado.puesto}</td>
                <td className="emp-td">
                  <div className="emp-actions">
                    <button 
                      className="emp-view-btn"
                      onClick={() => handleViewDetails(empleado)}
                    >
                      Ver
                    </button>
                    <button 
                      className="emp-edit-btn"
                      onClick={() => handleEdit(empleado)}
                    >
                      Editar
                    </button>
                    <button 
                      className="emp-delete-btn"
                      onClick={() => handleDelete(empleado.id_empleado)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Empleados;