import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { auth, signOut } from "../../lib/firebase";
import { icons } from "../ui/icons";

// Import feature components
import Dashboard from "../../features/dashboard/Dashboard";
import Sales from "../../features/sales/Sales";
import Purchases from "../../features/purchases/Purchases";
import ThirdParties from "../../features/third-parties/ThirdParties";
import Products from "../../features/products/Products";

const AppLayout = () => {
  const { userData, companyData } = useApp();
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const NavLink = ({ view, icon, children }) => (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        setActiveView(view);
      }}
      className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
        activeView === view
          ? "bg-indigo-600 text-white"
          : "text-gray-300 hover:bg-indigo-800 hover:text-white"
      }`}
    >
      <span className="mr-3">{icon}</span>
      {children}
    </a>
  );

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard />;
      case "sales":
        return <Sales setActiveView={setActiveView} />;
      case "purchases":
        return <Purchases setActiveView={setActiveView} />;
      case "thirdparties":
        return <ThirdParties />;
      case "products":
        return <Products />;
      default:
        return <Dashboard />;
    }
  };

  const roleNames = {
    Admin: "Administrador",
    Contador: "Contador",
    Empleado: "Empleado",
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans relative">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-indigo-900 text-white flex flex-col transform transition-transform duration-300 z-20
        ${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"}`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-indigo-800">
          <h2 className="text-xl font-bold truncate">
            {companyData?.name || "ERP Nube"}
          </h2>
          {/* Botón para colapsar */}
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
            className="text-gray-300 hover:text-white"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          <NavLink view="dashboard" icon={icons.dashboard}>
            Dashboard
          </NavLink>
          <NavLink view="sales" icon={icons.sales}>
            Ventas
          </NavLink>
          <NavLink view="purchases" icon={icons.purchases}>
            Compras
          </NavLink>
          <NavLink view="inventory" icon={icons.inventory}>
            Inventario
          </NavLink>
          <NavLink view="reports" icon={icons.reports}>
            Reportes
          </NavLink>
          <NavLink view="thirdparties" icon={icons.user}>
            Clientes/Proveedores
          </NavLink>
          <NavLink view="products" icon={icons.products}>
            Productos/Servicios
          </NavLink>
        </nav>

        {/* User Info + Logout */}
        <div className="px-4 py-4 border-t border-indigo-800">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-indigo-700 rounded-full">{icons.user}</div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{userData?.name}</p>
              <p className="text-xs text-indigo-300">
                {roleNames[userData?.role] || userData?.role}
              </p>
            </div>
          </div>
          <a
            href="#"
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
          >
            <span className="mr-3">{icons.logout}</span>
            Cerrar Sesión
          </a>
        </div>
      </aside>

      {/* Pestañita centrada con tooltip pro */}
      {!sidebarOpen && (
        <div className="fixed top-1/2 -translate-y-1/2 left-0 z-30 group">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
            className="bg-indigo-600 text-white p-2 rounded-r-md shadow-md transition-all duration-300 hover:bg-indigo-700 hover:-translate-x-1"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          {/* Tooltip */}
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none">
            Abrir menú
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-1 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
          <h1 className="text-2xl font-semibold text-gray-800 capitalize">
            {activeView}
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{renderContent()}</main>
      </div>
    </div>
  );
};

export default AppLayout;
