import  { useState, useEffect } from 'react';
import { PieChart, Pie, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/ReportesOrdenes.css';

const URL = import.meta.env.VITE_URL;

function ReporteOrdenes() {
  const [ordenes, setOrdenes] = useState([]);

  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        const response = await fetch(`${URL}ordenes`);
        const data = await response.json();
        setOrdenes(data);
      } catch (error) {
        console.error("Error al obtener órdenes:", error);
      }
    };

    fetchOrdenes();
  }, []);

  // Preparar datos para los gráficos
  const ordenesPorEstado = ordenes.reduce((acc, orden) => {
    acc[orden.estado] = (acc[orden.estado] || 0) + 1;
    return acc;
  }, {});

  const ordenesPorMes = ordenes.reduce((acc, orden) => {
    const mes = new Date(orden.fecha_inicio).getMonth();
    acc[mes] = (acc[mes] || 0) + 1;
    return acc;
  }, {});

  const costoPromedioPorServicio = ordenes.reduce((acc, orden) => {
    if (!acc[orden.servicio]) {
      acc[orden.servicio] = { total: 0, count: 0 };
    }
    acc[orden.servicio].total += parseFloat(orden.costo_total);
    acc[orden.servicio].count += 1;
    return acc;
  }, {});

  const dataEstado = Object.entries(ordenesPorEstado).map(([estado, cantidad]) => ({ estado, cantidad }));
  const dataMes = Object.entries(ordenesPorMes).map(([mes, cantidad]) => ({ mes: parseInt(mes) + 1, cantidad }));
  const dataServicio = Object.entries(costoPromedioPorServicio).map(([servicio, { total, count }]) => ({
    servicio,
    promedio: total / count
  }));

  return (
    <div className="reporte-container">
      <h1 className="reporte-titulo">Informe de Órdenes de Trabajo</h1>

      <div className="grafico-card">
        <h2>Órdenes por Estado</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie dataKey="cantidad" nameKey="estado" data={dataEstado} fill="#8884d8" label />
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grafico-card">
        <h2>Órdenes por Mes</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dataMes}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="cantidad" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grafico-card">
        <h2>Costo Promedio por Servicio</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataServicio}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="servicio" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="promedio" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ReporteOrdenes;
