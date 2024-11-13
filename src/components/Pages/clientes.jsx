import { useState, useEffect } from "react";
import MainLayout from "./MainLayout";
import "../styles/clientes.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const URL = import.meta.env.VITE_URL; // URL del backend
  const token = localStorage.getItem("token");

  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    dpi: "",
    nit: ""
});
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEditar, setModoEditar] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [mostrarCarnet, setMostrarCarnet] = useState(false);

  useEffect(() => {
    obtenerClientes();
  }, []);

  const obtenerClientes = () => {
    fetch(`${URL}clientes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setClientes(data);
        toast.success("Clientes cargados exitosamente");
      })
      .catch((error) => {
        console.error("Error al obtener clientes:", error);
        toast.error("Error al cargar los clientes");
      });
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoCliente(prevState => ({
        ...prevState,
        [name]: value
    }));
};

  const crearCliente = (e) => {
    e.preventDefault();
    fetch(`${URL}clientes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(nuevoCliente),
    })
      .then((response) => response.json())
      .then(() => {
        obtenerClientes();
        setNuevoCliente({ nombre: "", email: "", telefono: "", direccion: "", dpi: "", nit: "" });
        setMostrarModal(false);
        toast.success("Cliente creado exitosamente");
      })
      .catch((error) => {
        console.error("Error al crear cliente:", error);
        toast.error("Error al crear el cliente");
      });
  };

  const seleccionarCliente = (cliente) => {
    setModoEditar(true);
    setClienteSeleccionado(cliente);
    setNuevoCliente({
        nombre: cliente.nombre || "",
        email: cliente.email || "",
        telefono: cliente.telefono || "",
        direccion: cliente.direccion || "",
        dpi: cliente.dpi || "",
        nit: cliente.nit || ""
    });
    setMostrarModal(true);
};
  const actualizarCliente = (e) => {
    e.preventDefault();
    fetch(`${URL}clientes/${clienteSeleccionado.id_cliente}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(nuevoCliente),
    })
      .then((response) => response.json())
      .then(() => {
        obtenerClientes();
        setModoEditar(false);
        setMostrarModal(false);
        setNuevoCliente({ nombre: "", email: "", telefono: "", direccion: "", dpi: "", nit: "" });
        toast.success("Cliente actualizado exitosamente");
      })
      .catch((error) => {
        console.error("Error al actualizar cliente:", error);
        toast.error("Error al actualizar el cliente");
      });
  };

  const eliminarCliente = (id) => {
    if (window.confirm("¿Está seguro que desea eliminar este cliente?")) {
      fetch(`${URL}clientes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(() => {
          obtenerClientes();
          toast.success("Cliente eliminado exitosamente");
        })
        .catch((error) => {
          console.error("Error al eliminar cliente:", error);
          toast.error("Error al eliminar el cliente");
        });
    }
  };

  const verCarnet = (cliente) => {
    setClienteSeleccionado(cliente);
    setMostrarCarnet(true);
  };

  return (
    <MainLayout>
      <div className="clientes-container">
        <div className="clientes-header">
          <h1>Gestión de Clientes</h1>
          <button onClick={() => setMostrarModal(true)} className="nuevo-cliente-btn">+ Nuevo Cliente</button>
        </div>

        <div className="clientes-grid">
          {clientes.map((cliente) => (
            <div key={cliente.id_cliente} className="cliente-card">
              <h3>{cliente.nombre}</h3>
              <p>{cliente.email}</p>
              <p>dpi: {cliente.dpi}</p>
              <div className="cliente-actions">
                <button onClick={() => seleccionarCliente(cliente)} className="editar-btn">Editar</button>
                <button onClick={() => eliminarCliente(cliente.id_cliente)} className="eliminar-btn">Eliminar</button>
                <button onClick={() => verCarnet(cliente)} className="ver-carnet-btn">Ver Carnet</button>
              </div>
            </div>
          ))}
        </div>
        {mostrarModal && (
    <div className="modal">
        <div className="modal-content">
            <h2>{modoEditar ? "Editar Cliente" : "Nuevo Cliente"}</h2>
            <form onSubmit={modoEditar ? actualizarCliente : crearCliente}>
                <input 
                    type="text" 
                    name="nombre" 
                    placeholder="Nombre" 
                    value={nuevoCliente.nombre || ""} 
                    onChange={handleInputChange} 
                    required
                />
                <input 
                    type="email" 
                    name="email" 
                    placeholder="Email" 
                    value={nuevoCliente.email || ""} 
                    onChange={handleInputChange} 
                    required
                />
                <input 
                    type="tel" 
                    name="telefono" 
                    placeholder="Teléfono" 
                    value={nuevoCliente.telefono || ""} 
                    onChange={handleInputChange} 
                    required
                />
                <input 
                    type="text" 
                    name="direccion" 
                    placeholder="Dirección" 
                    value={nuevoCliente.direccion || ""} 
                    onChange={handleInputChange} 
                    required
                />
                <input 
                    type="text" 
                    name="dpi" 
                    placeholder="DPI" 
                    value={nuevoCliente.dpi || ""} 
                    onChange={handleInputChange} 
                    required
                />
                <input 
                    type="text" 
                    name="nit" 
                    placeholder="NIT" 
                    value={nuevoCliente.nit || ""} 
                    onChange={handleInputChange} 
                    required
                />

                <div className="modal-buttons">
                    <button 
                        type="button" 
                        onClick={() => {
                            setMostrarModal(false);
                            setNuevoCliente({
                                nombre: "",
                                email: "",
                                telefono: "",
                                direccion: "",
                                dpi: "",
                                nit: ""
                            });
                        }} 
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

        {mostrarCarnet && clienteSeleccionado && (
          <div className="modal">
            <div className="modal-content carnet">
              <h2>Carnet de Cliente</h2>
              <p><strong>Nombre:</strong> {clienteSeleccionado.nombre}</p>
              <p><strong>Email:</strong> {clienteSeleccionado.email}</p>
              <p><strong>Teléfono:</strong> {clienteSeleccionado.telefono}</p>
              <p><strong>Dirección:</strong> {clienteSeleccionado.direccion}</p>
              <p><strong>DPI:</strong> {clienteSeleccionado.dpi}</p>
              <p><strong>NIT:</strong> {clienteSeleccionado.nit}</p>

              <button onClick={() => setMostrarCarnet(false)} className="cerrar-carnet-btn">Cerrar</button>
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

export default Clientes;