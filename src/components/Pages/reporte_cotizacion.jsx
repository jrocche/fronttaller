import { useState, useEffect } from 'react';
import { PieChart, Pie, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/reporte_cotizacion.css';

const URL = import.meta.env.VITE_URL;

function ReporteCotizacion() {
  const [cotizaciones, setCotizaciones] = useState([]);

  useEffect(() => {
    const fetchCotizaciones = async () => {
      try {
        const response = await fetch(`${URL}cotizaciones`);
        const data = await response.json();
        setCotizaciones(data);
      } catch (error) {
        console.error("Error al obtener cotizaciones:", error);
      }
    };

    fetchCotizaciones();
  }, []);

  // Preparar datos para los gráficos
  const cotizacionesPorEstado = cotizaciones.reduce((acc, cotizacion) => {
    acc[cotizacion.estado] = (acc[cotizacion.estado] || 0) + 1;
    return acc;
  }, {});

  const cotizacionesPorMes = cotizaciones.reduce((acc, cotizacion) => {
    const mes = new Date(cotizacion.fecha).getMonth();
    acc[mes] = (acc[mes] || 0) + 1;
    return acc;
  }, {});

  const precioPromedioPorServicio = cotizaciones.reduce((acc, cotizacion) => {
    if (!acc[cotizacion.nombre_servicio]) {
      acc[cotizacion.nombre_servicio] = { total: 0, count: 0 };
    }
    acc[cotizacion.nombre_servicio].total += parseFloat(cotizacion.precio);
    acc[cotizacion.nombre_servicio].count += 1;
    return acc;
  }, {});

  const dataEstado = Object.entries(cotizacionesPorEstado).map(([estado, cantidad]) => ({ estado, cantidad }));
  const dataMes = Object.entries(cotizacionesPorMes).map(([mes, cantidad]) => ({ mes: parseInt(mes) + 1, cantidad }));
  const dataServicio = Object.entries(precioPromedioPorServicio).map(([servicio, { total, count }]) => ({
    servicio,
    promedio: total / count
  }));

  return (
    <div className="reporte-container">
      <h1 className="reporte-titulo">Informe de Cotizaciones</h1>

      <div className="grafico-card">
        <h2>Cotizaciones por Estado</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie dataKey="cantidad" nameKey="estado" data={dataEstado} fill="#8884d8" label />
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grafico-card">
        <h2>Cotizaciones por Mes</h2>
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
        <h2>Precio Promedio por Servicio</h2>
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

export default ReporteCotizacion;
