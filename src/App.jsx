import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"; // Asegúrate de importar Navigate
import Login from "./components/Pages/Login";
import Usuario from "./components/Pages/Usuario";
import MainLayout from "./components/Pages/MainLayout";
import ListaOrdenes from "./components/Pages/ListaOrdenes";
import Inicio from "./components/Pages/Inicio";
import Clientes from "./components/Pages/clientes"; 
import ListaCotizaciones from "./components/Pages/ListaCotizaciones";
import Categorias from "./components/Pages/categorias";
import Roles from "./components/Pages/Roles";
import Herramientas from "./components/Pages/herramientas";
import PrivateRoute from "./components/rutasprotegidas"; // Importa el componente PrivateRoute
import Reportecotizacion from "./components/Pages/reporte_cotizacion";
import ReportesOrdenes from "./components/Pages/ReportesOrdenes"; // Asegúrate de importar el componente
import Empleados from './components/Pages/empleados';



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Usuario" element={<PrivateRoute><MainLayout><Usuario /></MainLayout></PrivateRoute>} />
        <Route path="/Clientes" element={<PrivateRoute><MainLayout><Clientes /></MainLayout></PrivateRoute>} />
        <Route path="/inicio" element={<PrivateRoute><MainLayout><Inicio /></MainLayout></PrivateRoute>} />
        <Route path="/ListaOrdenes" element={<PrivateRoute><MainLayout><ListaOrdenes /></MainLayout></PrivateRoute>} />
        <Route path="/ListaCotizaciones" element={<PrivateRoute><MainLayout><ListaCotizaciones /></MainLayout></PrivateRoute>} />
        <Route path="/categorias" element={<PrivateRoute><MainLayout><Categorias /></MainLayout></PrivateRoute>} />
        <Route path="/roles" element={<PrivateRoute><MainLayout><Roles /></MainLayout></PrivateRoute>} />
        <Route path="/herramientas" element={<PrivateRoute><MainLayout><Herramientas /></MainLayout></PrivateRoute>} />
        <Route path="/reporte_cotizacion" element={<PrivateRoute><MainLayout><Reportecotizacion /></MainLayout></PrivateRoute>} />
        <Route path="/ReporteOrdenes" element={<Navigate to="/reportes-ordenes" />} />
        <Route path="/reportes-ordenes" element={<PrivateRoute><MainLayout><ReportesOrdenes /></MainLayout></PrivateRoute>} /> {/* Asegúrate de que esta línea esté presente */}
        <Route 
          path="/empleados" 
          element={
            <PrivateRoute>
              <MainLayout>
                <Empleados />
              </MainLayout>
            </PrivateRoute>
          } 
        />

        {/* Añade aquí las rutas para Reparaciones, Ingresos y Salidas cuando las implementes */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;