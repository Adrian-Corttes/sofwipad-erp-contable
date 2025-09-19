
import React from "react";
import { useApp } from "../../context/AppContext";
import { icons } from "../../components/ui/icons";
import Card from "../../components/ui/Card";

const Dashboard = () => {
  const { companyData } = useApp();
  const kpis = [
    {
      title: "Ventas del Mes",
      value: "$12,500,000",
      icon: icons.sales,
      color: "text-green-500",
    },
    {
      title: "Cuentas por Cobrar",
      value: "$4,200,000",
      icon: icons.money,
      color: "text-yellow-500",
    },
    {
      title: "Compras del Mes",
      value: "$7,800,000",
      icon: icons.purchases,
      color: "text-red-500",
    },
    {
      title: "Valor Inventario",
      value: "$25,000,000",
      icon: icons.inventory,
      color: "text-blue-500",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-700">
        Bienvenido a {companyData?.name}
      </h2>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div
            key={kpi.title}
            className="bg-white p-6 rounded-lg shadow-md flex items-center"
          >
            <div className={`p-3 rounded-full bg-gray-100 ${kpi.color}`}>
              {React.cloneElement(kpi.icon, { className: "h-8 w-8" })}
            </div>
            <div className="ml-4">
              {/* Título grande */}
              <p className="text-lg font-semibold text-gray-800">{kpi.title}</p>
              {/* Valor pequeño */}
              <p className="text-sm font-medium text-gray-500">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Otras secciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Ventas vs Compras (Últimos 6 meses)">
          <div className="h-64 bg-gray-200 rounded-md flex items-center justify-center">
            <p className="text-gray-500">Gráfico de barras aquí</p>
          </div>
        </Card>
        <Card title="Actividades Recientes">
          <ul className="space-y-3">
            <li className="text-sm text-gray-600">
              Factura de venta #FV-002 creada.
            </li>
            <li className="text-sm text-gray-600">
              Pago a proveedor 'DistriPartes SAS' registrado.
            </li>
            <li className="text-sm text-gray-600">
              Nuevo producto 'Aceite 20W-50' añadido al inventario.
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
