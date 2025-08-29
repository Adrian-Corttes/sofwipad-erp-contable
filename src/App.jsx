import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInAnonymously,
  signInWithCustomToken,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  getDocs,
  limit,
  increment,
  orderBy,
} from "firebase/firestore";
import { setLogLevel } from "firebase/firestore";
import { Edit, Trash } from "lucide-react";

// --- Íconos SVG para una mejor UI ---
const icons = {
  dashboard: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  ),
  sales: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </svg>
  ),
  products: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 7.5L12 3l9 4.5M3 7.5v9l9 4.5m9-13.5v9l-9 4.5m0-9l9-4.5m-9 4.5L3 7.5"
      />
    </svg>
  ),
  purchases: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    </svg>
  ),
  inventory: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
      />
    </svg>
  ),
  reports: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
  settings: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  logout: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  ),
  plus: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 mr-2"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
      />
    </svg>
  ),
  user: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
  company: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  ),
  money: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  ),
  close: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
  trash: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  ),
  edit: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"
      />
    </svg>
  ),
  filter: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 mr-2"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 4h18M6 12h12M10 20h4"
      />
    </svg>
  ),
  userPlus: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 mr-2"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 14a4 4 0 10-8 0 4 4 0 008 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 14v7m-5-3h10M16 3h5m-2.5-2.5V5.5"
      />
    </svg>
  ),
};

// --- Configuración de Firebase ---
// FIX: Se usa la configuración que provees, pero se mantiene la lógica para el entorno de Canvas.
const firebaseConfig =
  typeof __firebase_config !== "undefined"
    ? JSON.parse(__firebase_config)
    : {
        apiKey: "AIzaSyA6pwcMnIn0y0HcKRWQhfpvPKwmbH-Jc4Y",
        authDomain: "sofwipad-erp-contable.firebaseapp.com",
        projectId: "sofwipad-erp-contable",
        storageBucket: "sofwipad-erp-contable.appspot.com", // Corregido: suele ser .appspot.com
        messagingSenderId: "902895181248",
        appId: "1:902895181248:web:dfb884b039dedacfb3bc25",
        measurementId: "G-D22KTMEDP6",
      };

const appId = typeof __app_id !== "undefined" ? __app_id : "default-erp-app";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
setLogLevel("debug");

// --- Contexto de Autenticación y Datos ---
const AppContext = createContext();
// -- Autenticaciòn y Configuración Inicial ---
const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const setupInitialChartOfAccounts = async (companyId) => {
    const batch = writeBatch(db);
    const chartOfAccountsRef = collection(
      db,
      `companies/${companyId}/chart_of_accounts`
    );

    const accounts = [
      { code: "1105", name: "Caja", class: "Activo" },
      { code: "1110", name: "Bancos", class: "Activo" },
      { code: "1305", name: "Clientes", class: "Activo" },
      { code: "1435", name: "Inventarios", class: "Activo" },
      { code: "2205", name: "Proveedores Nacionales", class: "Pasivo" },
      { code: "2105", name: "Obligaciones Financieras", class: "Pasivo" },
      { code: "3115", name: "Aportes Sociales", class: "Patrimonio" },
      {
        code: "4135",
        name: "Comercio al por mayor y al por menor",
        class: "Ingreso",
      },
      { code: "5105", name: "Gastos de Personal", class: "Gasto" },
      { code: "5195", name: "Diversos", class: "Gasto" },
      { code: "6135", name: "Costo de Ventas", class: "Costo" },
    ];

    accounts.forEach((account) => {
      const docRef = doc(chartOfAccountsRef, account.code);
      batch.set(docRef, account);
    });

    try {
      await batch.commit();
      console.log(
        `Plan de cuentas inicial creado para la empresa: ${companyId}`
      );
    } catch (err) {
      console.error("Error creando el plan de cuentas inicial:", err);
      setError("No se pudo completar la configuración inicial de la empresa.");
    }
  };

  useEffect(() => {
    const authAndSetup = async (firebaseUser) => {
      if (firebaseUser && !firebaseUser.isAnonymous) {
        const userDocRef = doc(db, `users`, firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const fetchedUserData = {
            uid: firebaseUser.uid,
            ...userDocSnap.data(),
          };
          setUser(firebaseUser);
          setUserData(fetchedUserData);

          if (fetchedUserData.companyId) {
            const companyDocRef = doc(
              db,
              `companies`,
              fetchedUserData.companyId
            );
            const companyDocSnap = await getDoc(companyDocRef);
            if (companyDocSnap.exists()) {
              setCompanyData({
                id: companyDocSnap.id,
                ...companyDocSnap.data(),
              });

              const chartOfAccountsRef = collection(
                db,
                `companies/${fetchedUserData.companyId}/chart_of_accounts`
              );
              const q = query(chartOfAccountsRef, limit(1));
              const snapshot = await getDocs(q);
              if (snapshot.empty) {
                console.log(
                  "Plan de cuentas no encontrado, iniciando configuración..."
                );
                await setupInitialChartOfAccounts(fetchedUserData.companyId);
              }
            } else {
              setError(
                `Error: La empresa con ID ${fetchedUserData.companyId} no fue encontrada.`
              );
              setCompanyData(null);
            }
          } else {
            setError("Usuario no está asociado a ninguna empresa.");
            setCompanyData(null);
          }
        } else {
          setError("No se encontró el perfil del usuario en la base de datos.");
          await signOut(auth);
        }
      } else {
        setUser(null);
        setUserData(null);
        setCompanyData(null);
      }
      setLoading(false);
    };

    // FIX: Se elimina la lógica de `handleInitialAuth` que causaba el error en desarrollo.
    // onAuthStateChanged es suficiente para manejar el estado de autenticación.
    const unsubscribe = onAuthStateChanged(auth, authAndSetup);

    return () => unsubscribe();
  }, []);

  const value = { user, userData, companyData, loading, error, setError };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
// -- Hook para usar el contexto de la aplicación --
const useApp = () => useContext(AppContext);

// --- Componentes Reutilizables de UI ---
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            {icons.close}
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
// --- Form Inputs ---
const Input = ({ id, label, ...props }) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
    </label>
    <input
      id={id}
      {...props}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    />
  </div>
);

const Select = ({ id, label, children, ...props }) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
    </label>
    <select
      id={id}
      {...props}
      className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    >
      {children}
    </select>
  </div>
);

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantClasses = {
    primary:
      "border-transparent text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500",
    secondary:
      "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-indigo-500",
    danger:
      "border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ title, children, actions }) => (
  <div className="bg-white shadow-md rounded-lg overflow-hidden">
    <div className="p-4 border-b flex justify-between items-center">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {actions && <div className="flex space-x-2">{actions}</div>}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const Spinner = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

const ErrorDisplay = ({ message }) => {
  if (!message) return null;
  return (
    <div
      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative my-4"
      role="alert"
    >
      <strong className="font-bold">Error: </strong>
      <span className="block sm:inline">{message}</span>
    </div>
  );
};
// --- Módulo de Autenticación y Registro ---
const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [nit, setNit] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const companyRef = collection(db, "companies");
      const newCompanyDoc = await addDoc(companyRef, {
        name: companyName,
        NIT: nit,
        createdAt: serverTimestamp(),
        taxConfig: {
          iva: 19,
          ica: 0.414,
          retefuente: 2.5,
        },
      });

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        companyId: newCompanyDoc.id,
        role: "Admin",
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Sofwipad ERP Contable
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {isLogin
            ? "Inicia sesión en tu cuenta"
            : "Crea una nueva cuenta y empresa"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <form
            className="space-y-6"
            onSubmit={isLogin ? handleLogin : handleRegister}
          >
            {!isLogin && (
              <>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  label="Tu Nombre Completo"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  label="Nombre de la Empresa"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
                <Input
                  id="nit"
                  name="nit"
                  type="text"
                  label="NIT de la Empresa"
                  required
                  value={nit}
                  onChange={(e) => setNit(e.target.value)}
                />
                <hr />
              </>
            )}
            <Input
              id="email"
              name="email"
              type="email"
              label="Correo Electrónico"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              id="password"
              name="password"
              type="password"
              label="Contraseña"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <ErrorDisplay message={error} />

            <div>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading}
              >
                {loading
                  ? "Procesando..."
                  : isLogin
                  ? "Iniciar Sesión"
                  : "Registrar Empresa"}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                {isLogin
                  ? "¿No tienes una cuenta? Regístrate"
                  : "¿Ya tienes una cuenta? Inicia sesión"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
// --- Layout Principal de la Aplicación ---
import { ChevronLeft, ChevronRight } from "lucide-react";

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
        return <SalesModule setActiveView={setActiveView} />;
      case "thirdparties":
        return <ThirdPartiesModule />;
      case "products":
        return <ProductsServicesModule />;
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
// --- Módulos ---
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
// --- Módulo de Ventas ---
const SalesModule = ({ setActiveView }) => {
  const { companyData } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastInvoiceNumber, setLastInvoiceNumber] = useState(null); // ✅ última factura

  // --- Obtener facturas ---
  useEffect(() => {
    if (!companyData) return;
    setLoading(true);
    const q = query(collection(db, `companies/${companyData.id}/invoices_sales`));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const invoicesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInvoices(invoicesData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching invoices: ", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [companyData]);

  // --- Obtener clientes y productos ---
  useEffect(() => {
    if (!companyData) return;
    const clientsQuery = query(collection(db, `companies/${companyData.id}/thirdparties`));
    const productsQuery = query(collection(db, `companies/${companyData.id}/products`));

    const unsubClients = onSnapshot(clientsQuery, (snapshot) => {
      setClients(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    const unsubProducts = onSnapshot(productsQuery, (snapshot) => {
      setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubClients();
      unsubProducts();
    };
  }, [companyData]);

  // --- Última factura registrada ---
  useEffect(() => {
    if (!companyData) return;

    const q = query(
      collection(db, `companies/${companyData.id}/invoices_sales`),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const lastInvoice = snapshot.docs[0].data();
        setLastInvoiceNumber(lastInvoice.invoiceNumber);
      } else {
        setLastInvoiceNumber(null);
      }
    });

    return () => unsubscribe();
  }, [companyData]);

  // --- Crear factura ---
  const handleCreateInvoice = async (invoiceData) => {
    if (!companyData) return;
    try {
      const counterRef = doc(db, `companies/${companyData.id}/counters/invoices_sales`);
      await setDoc(counterRef, { lastNumber: increment(1) }, { merge: true });

      const counterSnap = await getDoc(counterRef);
      const nextNumber = counterSnap.exists() ? counterSnap.data().lastNumber : 1;

      const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
      const invoiceNumber = `FV-${String(nextNumber).padStart(3, "0")}${randomPart}`;

      const invoicesRef = collection(db, `companies/${companyData.id}/invoices_sales`);
      const newInvoiceRef = await addDoc(invoicesRef, {
        ...invoiceData,
        companyId: companyData.id,
        invoiceNumber,
        createdAt: serverTimestamp(),
        status: "Pendiente",
      });

      await updateDoc(newInvoiceRef, { id: newInvoiceRef.id });

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating invoice: ", error);
    }
  };

  // --- Editar factura ---
  const handleUpdateInvoice = async (invoiceData) => {
    if (!companyData || !editingInvoice) return;
    try {
      const invoiceRef = doc(db, `companies/${companyData.id}/invoices_sales/${editingInvoice.id}`);
      await updateDoc(invoiceRef, {
        ...invoiceData,
        updatedAt: serverTimestamp(),
      });
      setEditingInvoice(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating invoice: ", error);
    }
  };

  // --- Eliminar factura ---
  const handleDeleteInvoice = async (id) => {
    if (!companyData) return;
    if (!window.confirm("¿Seguro que deseas eliminar esta factura?")) return;
    try {
      const path = `companies/${companyData.id}/invoices_sales/${id}`;
      console.log("🗑️ Intentando borrar:", path);
      await deleteDoc(doc(db, path));
      console.log("✅ Factura eliminada correctamente");
    } catch (error) {
      console.error("❌ Error deleting invoice: ", error);
      alert("Error eliminando factura: " + error.message);
    }
  };

  return (
    <div>
      {/* Tabs estilo Siigo */}
      <div className="border-b mb-4">
        <nav className="flex space-x-6 text-sm font-medium text-gray-600">
          <button className="border-b-2 border-blue-600 text-blue-600 pb-2">
            Documentos de venta
          </button>
          <button className="pb-2 hover:text-blue-600">Facturas recurrentes</button>
          <button className="pb-2 hover:text-blue-600">Clientes</button>
          <button className="pb-2 hover:text-blue-600">Seguimiento comercial</button>
        </nav>
      </div>

      {/* Acciones */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Buscar por Identificación o Cliente"
            className="border px-3 py-2 rounded-lg text-sm w-80"
          />
          <Button variant="secondary">{icons.filter} Filtros</Button>
        </div>
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setActiveView("thirdparties")}
          >
            {icons.userPlus} Crear Cliente
          </Button>
          <Button
            onClick={() => {
              setEditingInvoice(null);
              setIsModalOpen(true);
            }}
          >
            {icons.plus} Crear Factura
          </Button>
        </div>
      </div>

      {/* Tabla de facturas */}
      <Card title="Facturas de Venta">
        {loading ? (
          <Spinner />
        ) : (
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">Comprobante</th>
                <th className="px-6 py-3">Identificación</th>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Moneda</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {invoice.date?.seconds
                      ? new Date(invoice.date.seconds * 1000).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 font-medium text-blue-600">
                    {invoice.invoiceNumber || "FV-SINID"}
                  </td>
                  <td className="px-6 py-4">
                    {clients.find((c) => c.id === invoice.clientId)?.idNumber || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    {clients.find((c) => c.id === invoice.clientId)?.name || "Consumidor Final"}
                  </td>
                  <td className="px-6 py-4">
                    ${new Intl.NumberFormat("es-CO").format(invoice.total || 0)}
                  </td>
                  <td className="px-6 py-4">COP</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        invoice.status === "Pagada"
                          ? "bg-green-100 text-green-800"
                          : invoice.status === "Vencida"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {invoice.status || "Pendiente"}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex space-x-2">
                    {/* Editar */}
                    <button
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={() => {
                        setEditingInvoice(invoice);
                        setIsModalOpen(true);
                      }}
                    >
                      {icons.edit}
                    </button>
                    {/* Eliminar */}
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteInvoice(invoice.id)}
                    >
                      {icons.trash}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Modal Crear/Editar Factura */}
      <InvoiceFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingInvoice(null);
        }}
        onSubmit={editingInvoice ? handleUpdateInvoice : handleCreateInvoice}
        clients={clients}
        products={products}
        initialData={editingInvoice}
        lastInvoiceNumber={lastInvoiceNumber} // ✅ aquí pasa el consecutivo real
      />
    </div>
  );
};
// --- Módulo de Terceros (Clientes/Proveedores/Otros) ---
const ThirdPartiesModule = () => {
  const { companyData } = useApp();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");

  // formulario
  const [form, setForm] = useState({
    type: "cliente", // cliente | proveedor | otro
    personType: "persona", // persona | empresa
    idType: "CC", // CC | NIT (según personType)
    idNumber: "",
    name: "",
    lastName: "",
    tradeName: "", // nombre comercial (para empresa o alias)
    city: "",
    address: "",
    phone: "",
    email: "",
    createdAt: null,
  });

  // helpers
  const fullName = (r) =>
    r.personType === "empresa"
      ? r.tradeName || `${r.name}` || ""
      : `${r.name || ""} ${r.lastName || ""}`.trim();

  const idTypeLabel = (v) => (v === "NIT" ? "NIT" : "CC");

  // carga
  useEffect(() => {
    if (!companyData) return;
    const q = query(collection(db, `companies/${companyData.id}/thirdparties`));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Error loading third parties:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [companyData]);

  // filtro de búsqueda
  const filtered = rows.filter((r) => {
    const t = search.toLowerCase();
    return (
      (r.idNumber || "").toLowerCase().includes(t) ||
      (r.name || "").toLowerCase().includes(t) ||
      (r.lastName || "").toLowerCase().includes(t) ||
      (r.tradeName || "").toLowerCase().includes(t) ||
      (r.email || "").toLowerCase().includes(t)
    );
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({
      type: "cliente",
      personType: "persona",
      idType: "CC",
      idNumber: "",
      name: "",
      lastName: "",
      tradeName: "",
      city: "",
      address: "",
      phone: "",
      email: "",
      createdAt: null,
    });
    setIsModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({
      type: row.type || "cliente",
      personType: row.personType || "persona",
      idType: row.idType || (row.personType === "empresa" ? "NIT" : "CC"),
      idNumber: row.idNumber || "",
      name: row.name || "",
      lastName: row.lastName || "",
      tradeName: row.tradeName || "",
      city: row.city || "",
      address: row.address || "",
      phone: row.phone || "",
      email: row.email || "",
      createdAt: row.createdAt || null,
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // si cambia el tipo de persona, ajustar idType automáticamente
    if (name === "personType") {
      setForm((p) => ({
        ...p,
        personType: value,
        idType: value === "empresa" ? "NIT" : "CC",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!companyData) return;

    const payload = {
      type: form.type, // cliente | proveedor | otro
      personType: form.personType, // persona | empresa
      idType: form.idType, // CC | NIT
      idNumber: String(form.idNumber).trim(),
      name: String(form.name).trim(),
      lastName: String(form.lastName).trim(),
      tradeName: String(form.tradeName).trim(),
      city: String(form.city).trim(),
      address: String(form.address).trim(),
      phone: String(form.phone).trim(),
      email: String(form.email).trim(),
      createdAt: editingId ? form.createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingId) {
        await updateDoc(
          doc(db, `companies/${companyData.id}/thirdparties/${editingId}`),
          payload
        );
      } else {
        await addDoc(
          collection(db, `companies/${companyData.id}/thirdparties`),
          payload
        );
      }
      setIsModalOpen(false);
      setEditingId(null);
    } catch (err) {
      console.error("Error saving third party", err);
      alert("⚠️ Error guardando tercero: " + err.message);
    }
  };

  const handleDelete = async (row) => {
    if (!companyData) return;
    if (
      !confirm(
        `¿Eliminar "${fullName(row)}"? Esta acción no se puede deshacer.`
      )
    )
      return;
    try {
      await deleteDoc(
        doc(db, `companies/${companyData.id}/thirdparties/${row.id}`)
      );
    } catch (err) {
      console.error("Error deleting third party", err);
      alert("⚠️ Error eliminando: " + err.message);
    }
  };

  return (
    <div>
      {/* acciones superiores */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Buscar por identificación, nombre o correo"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-lg text-sm w-80"
        />
        <Button onClick={openCreate}>{icons.plus} Nuevo Tercero</Button>
      </div>

      {/* tabla */}
      <Card title="Terceros (Clientes, Proveedores y Otros)">
        {loading ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 bg-gray-50">Tipo</th>
                  <th className="px-6 py-3 bg-gray-50">Tipo Persona</th>
                  <th className="px-6 py-3 bg-gray-50">Identificación</th>
                  <th className="px-6 py-3 bg-gray-50">
                    Nombre / Razón social
                  </th>
                  <th className="px-6 py-3 bg-gray-50">Ciudad</th>
                  <th className="px-6 py-3 bg-gray-50">Teléfono</th>
                  <th className="px-6 py-3 bg-gray-50">Correo</th>
                  <th className="px-6 py-3 bg-gray-50">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-3 capitalize">{r.type}</td>
                    <td className="px-6 py-3 capitalize">{r.personType}</td>
                    <td className="px-6 py-3">
                      {idTypeLabel(r.idType)} {r.idNumber}
                    </td>
                    <td className="px-6 py-3">{fullName(r)}</td>
                    <td className="px-6 py-3">{r.city}</td>
                    <td className="px-6 py-3">{r.phone}</td>
                    <td className="px-6 py-3">{r.email}</td>
                    <td className="px-6 py-3 flex space-x-2">
                      <button
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => openEdit(r)}
                      >
                        {icons.edit}
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(r)}
                      >
                        {icons.trash}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-gray-500">
                      No se encontraron resultados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${editingId ? "Editar" : "Crear"} Tercero`}
      >
        <form onSubmit={handleSave} className="space-y-6">
          {/* Tipo de tercero */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Tipo de tercero</h3>
            <div className="flex items-center space-x-6">
              {["cliente", "proveedor", "otro"].map((t) => (
                <label
                  key={t}
                  className="flex items-center space-x-2 capitalize"
                >
                  <input
                    type="radio"
                    name="type"
                    value={t}
                    checked={form.type === t}
                    onChange={handleChange}
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Datos de identificación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              id="personType"
              name="personType"
              label="Tipo de Persona"
              value={form.personType}
              onChange={handleChange}
            >
              <option value="persona">Persona</option>
              <option value="empresa">Empresa</option>
            </Select>

            <Select
              id="idType"
              name="idType"
              label="Tipo de Identificación"
              value={form.idType}
              onChange={handleChange}
            >
              {form.personType === "empresa" ? (
                <option value="NIT">NIT</option>
              ) : (
                <option value="CC">Cédula de Ciudadanía (CC)</option>
              )}
            </Select>

            <Input
              id="idNumber"
              name="idNumber"
              label={
                form.personType === "empresa"
                  ? "Número de NIT"
                  : "Número de Cédula"
              }
              value={form.idNumber}
              onChange={handleChange}
              required
            />
            <Input
              id="name"
              name="name"
              label={
                form.personType === "empresa"
                  ? "Razón Social / Nombre Legal"
                  : "Nombres"
              }
              value={form.name}
              onChange={handleChange}
              required
            />

            {form.personType === "persona" ? (
              <Input
                id="lastName"
                name="lastName"
                label="Apellidos"
                value={form.lastName}
                onChange={handleChange}
              />
            ) : (
              <Input
                id="tradeName"
                name="tradeName"
                label="Nombre Comercial"
                value={form.tradeName}
                onChange={handleChange}
              />
            )}

            <Input
              id="city"
              name="city"
              label="Ciudad"
              value={form.city}
              onChange={handleChange}
            />
            <Input
              id="address"
              name="address"
              label="Dirección"
              value={form.address}
              onChange={handleChange}
            />
            <Input
              id="phone"
              name="phone"
              label="Teléfono"
              value={form.phone}
              onChange={handleChange}
            />
            <Input
              id="email"
              name="email"
              type="email"
              label="Correo Electrónico"
              value={form.email}
              onChange={handleChange}
            />

            {/* Fecha creación (solo en edición) */}
            {editingId && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Fecha de creación
                </label>
                <input
                  type="text"
                  value={
                    form.createdAt
                      ? new Date(form.createdAt.seconds * 1000).toLocaleString(
                          "es-CO"
                        )
                      : ""
                  }
                  readOnly
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                />
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {editingId ? "Actualizar" : "Guardar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
// --- Módulo de Productos / Servicios ---
const ProductsServicesModule = () => {
  const { companyData } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState(""); // 🔎 estado de búsqueda
  const [form, setForm] = useState({
    type: "producto", // producto | servicio
    code: "",
    description: "",
    quantity: 0,
    unit: "unidades",
    unitValue: 0,
    taxed: true,
    iva: 19,
    createdAt: null,
  });

  const units = ["unidades", "centímetros", "metros", "kilogramos", "litros"];

  // Cargar productos/servicios
  useEffect(() => {
    if (!companyData) return;
    const q = query(collection(db, `companies/${companyData.id}/products`));
    const unsub = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [companyData]);

  // 🔎 Filtrar items según la búsqueda
  const filteredItems = items.filter((r) => {
    const term = search.toLowerCase();
    return (
      r.code?.toLowerCase().includes(term) ||
      r.description?.toLowerCase().includes(term) ||
      r.name?.toLowerCase().includes(term)
    );
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({
      type: "producto",
      code: "",
      description: "",
      quantity: 0,
      unit: "unidades",
      unitValue: 0,
      taxed: true,
      iva: 19,
      createdAt: null,
    });
    setIsModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({
      type: row.type || "producto",
      code: row.code || "",
      description: row.description || "",
      quantity: row.quantity ?? 0,
      unit: row.unit || "unidades",
      unitValue: row.unitValue ?? 0,
      taxed: row.taxed ?? true,
      iva: row.iva ?? "",
      createdAt: row.createdAt || null,
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!companyData) return;

    try {
      let productCode = form.code;

      // 👉 Generar código consecutivo con prefijo
      if (!editingId) {
        const typeKey = form.type === "producto" ? "products" : "services";
        const counterRef = doc(
          db,
          `companies/${companyData.id}/counters/${typeKey}`
        );
        await setDoc(counterRef, { lastCode: increment(1) }, { merge: true });

        const counterSnap = await getDoc(counterRef);
        const nextNumber = counterSnap.exists()
          ? counterSnap.data().lastCode
          : 1;

        const prefix = form.type === "producto" ? "P" : "S";
        productCode = `${prefix}-${String(nextNumber).padStart(3, "0")}`;
      }

      const payload = {
        type: form.type,
        code: productCode,
        description: String(form.description).trim(),
        name: String(form.description).trim(), // ✅ agregado para facturas
        quantity: Number(form.quantity) || 0,
        unit: form.unit,
        unitValue: Number(form.unitValue) || 0,
        taxed: Boolean(form.taxed),
        iva: form.taxed ? (form.iva === "" ? null : Number(form.iva)) : 0, // ✅ evitar string vacío
        createdAt: editingId ? form.createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(
          doc(db, `companies/${companyData.id}/products/${editingId}`),
          payload
        );
      } else {
        await addDoc(
          collection(db, `companies/${companyData.id}/products`),
          payload
        );
      }

      setIsModalOpen(false);
      setEditingId(null);
    } catch (err) {
      console.error("Error guardando producto/servicio", err);
      alert("⚠️ Error guardando producto/servicio: " + err.message);
    }
  };

  const handleDelete = async (row) => {
    if (!companyData) return;
    if (
      !confirm(
        `¿Eliminar "${row.description}"? Esta acción no se puede deshacer.`
      )
    )
      return;
    try {
      await deleteDoc(
        doc(db, `companies/${companyData.id}/products/${row.id}`)
      );
    } catch (err) {
      console.error("Error eliminando producto/servicio", err);
      alert("⚠️ Error eliminando: " + err.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        {/* 🔎 Campo de búsqueda */}
        <input
          type="text"
          placeholder="Buscar por código o descripción"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-lg text-sm w-80"
        />
        <Button onClick={openCreate}>
          {icons.plus} Nuevo Producto/Servicio
        </Button>
      </div>

      <Card title="Productos y Servicios">
        {loading ? (
          <Spinner />
        ) : (
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Código</th>
                <th className="px-6 py-3">Descripción</th>
                <th className="px-6 py-3">Cantidad</th>
                <th className="px-6 py-3">Unidad</th>
                <th className="px-6 py-3">Valor Unitario</th>
                <th className="px-6 py-3">Gravado IVA</th>
                <th className="px-6 py-3">IVA</th>
                <th className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((r) => (
                <tr key={r.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-3 capitalize">{r.type}</td>
                  <td className="px-6 py-3">{r.code}</td>
                  <td className="px-6 py-3">{r.description}</td>
                  <td className="px-6 py-3 text-right">{r.quantity}</td>
                  <td className="px-6 py-3">{r.unit}</td>
                  <td className="px-6 py-3 text-right">
                    ${new Intl.NumberFormat("es-CO").format(r.unitValue || 0)}
                  </td>
                  <td className="px-6 py-3">{r.taxed ? "Sí" : "No"}</td>
                  <td className="px-6 py-3">
                    {r.iva === null || r.iva === ""
                      ? "No especificado"
                      : `${r.iva}%`}
                  </td>
                  <td className="px-6 py-3 flex space-x-2">
                    <button
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={() => openEdit(r)}
                    >
                      {icons.edit}
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDelete(r)}
                    >
                      {icons.trash}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-gray-500">
                    No se encontraron resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${editingId ? "Editar" : "Crear"} Producto/Servicio`}
      >
        <form onSubmit={handleSave} className="space-y-6">
          {/* Tipo */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Tipo</h3>
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="type"
                  value="producto"
                  checked={form.type === "producto"}
                  onChange={handleChange}
                />
                <span>Producto</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="type"
                  value="servicio"
                  checked={form.type === "servicio"}
                  onChange={handleChange}
                />
                <span>Servicio</span>
              </label>
            </div>
          </div>

          {/* Información */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Información del {form.type}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="description"
                name="description"
                label="Descripción"
                value={form.description}
                onChange={handleChange}
                required
              />
              <Input
                id="quantity"
                name="quantity"
                type="number"
                label="Cantidad"
                value={form.quantity}
                onChange={handleChange}
                min="0"
              />
              <Select
                id="unit"
                name="unit"
                label="Unidad de medida"
                value={form.unit}
                onChange={handleChange}
              >
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
              <Input
                id="unitValue"
                name="unitValue"
                type="number"
                label="Valor unitario"
                value={form.unitValue}
                onChange={handleChange}
                min="0"
                step="0.01"
              />

              {/* Fecha de creación (solo en edición) */}
              {editingId && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha de creación
                  </label>
                  <input
                    type="text"
                    value={
                      form.createdAt
                        ? new Date(
                            form.createdAt.seconds * 1000
                          ).toLocaleDateString("es-CO")
                        : ""
                    }
                    readOnly
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Impuestos */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Impuestos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="taxed"
                  checked={form.taxed}
                  onChange={handleChange}
                />
                <span>Gravado con IVA</span>
              </div>
              <Select
                id="iva"
                name="iva"
                label="IVA"
                value={form.iva}
                onChange={handleChange}
                disabled={!form.taxed}
              >
                <option value="">No especificado</option>
                <option value={0}>0%</option>
                <option value={5}>5%</option>
                <option value={19}>19%</option>
              </Select>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
// Modal Crear Factura
const InvoiceFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  clients,
  products,
  initialData,
  lastInvoiceNumber, // ✅ viene desde el padre
}) => {
  const { userData } = useApp();

  const [tipoFactura, setTipoFactura] = useState("Electrónica");
  const [clientId, setClientId] = useState("");
  const [date, setDate] = useState(() => {
    const today = new Date();
    return new Date(today.getTime() - today.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
  });
  const [items, setItems] = useState([
    {
      productId: "",
      code: "",
      name: "",
      quantity: 1,
      price: 0,
      discount: 0,
      tax: "", // ✅ puede estar vacío
      retention: 0,
    },
  ]);
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");
  const [observaciones, setObservaciones] = useState("");

  // Totales
  const [subtotal, setSubtotal] = useState(0);
  const [iva, setIva] = useState(0);
  const [retenciones, setRetenciones] = useState(0);
  const [totalNeto, setTotalNeto] = useState(0);

  // Función para sugerir siguiente número
  const getNextInvoiceNumber = (lastInvoiceNumber) => {
    if (!lastInvoiceNumber) return null;

    const match = lastInvoiceNumber.match(/^FV-(\d+)([A-Z0-9]+)?$/);
    if (!match) return null;

    const num = parseInt(match[1], 10) + 1;
    const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();

    return `FV-${String(num).padStart(3, "0")}${randomPart}`;
  };

  // ✅ Si hay initialData, precargar estados
  useEffect(() => {
    if (initialData) {
      setTipoFactura(initialData.tipoFactura || "Electrónica");
      setClientId(initialData.clientId || "");
      setDate(
        initialData.date
          ? new Date(initialData.date.seconds * 1000)
              .toISOString()
              .split("T")[0]
          : date
      );
      setItems(initialData.items || []);
      setPaymentMethod(initialData.paymentMethod || "Efectivo");
      setObservaciones(initialData.observaciones || "");
    }
  }, [initialData]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    if (field === "productId") {
      if (value === "") {
        // ✅ si selecciona vacío, limpiar
        newItems[index] = {
          productId: "",
          code: "",
          name: "",
          quantity: 1,
          price: 0,
          discount: 0,
          tax: "",
          retention: 0,
        };
      } else {
        const product = products.find((p) => p.id === value);
        if (product) {
          newItems[index].price = product.unitValue || 0;
          newItems[index].tax = product.iva ?? "";
          newItems[index].code = product.code || "";
          newItems[index].name = product.name || product.description || "";
        }
      }
    }

    setItems(newItems);
  };

  const addItem = () =>
    setItems([
      ...items,
      {
        productId: "",
        code: "",
        name: "",
        quantity: 1,
        price: 0,
        discount: 0,
        tax: "",
        retention: 0,
      },
    ]);

  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  // Totales automáticos
  useEffect(() => {
    let sub = 0;
    let ivaCalc = 0;
    let ret = 0;

    items.forEach((item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const desc = (Number(item.discount) || 0) / 100;
      const base = qty * price * (1 - desc);

      const taxRate = item.tax === "" ? 0 : Number(item.tax) / 100; // ✅ vacío = 0
      sub += base;
      ivaCalc += base * taxRate;
      ret += Number(item.retention) || 0;
    });

    setSubtotal(sub);
    setIva(ivaCalc);
    setRetenciones(ret);
    setTotalNeto(sub + ivaCalc - ret);
  }, [items]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newInvoiceNumber = !initialData
      ? getNextInvoiceNumber(lastInvoiceNumber)
      : initialData.invoiceNumber;

    const invoiceData = {
      id: initialData?.id || null,
      tipoFactura,
      clientId,
      vendedor: userData?.name || "Usuario",
      date: new Date(date),
      items: items.map((i) => ({
        ...i,
        quantity: Number(i.quantity),
        price: Number(i.price),
        discount: Number(i.discount),
        tax: i.tax === "" ? null : Number(i.tax), // ✅ guardamos null si vacío
        retention: Number(i.retention),
      })),
      paymentMethod,
      observaciones,
      subtotal,
      iva,
      retenciones,
      total: totalNeto,
      invoiceNumber: newInvoiceNumber, // ✅ Guardar consecutivo único
    };

    onSubmit(invoiceData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        initialData ? "Editar Factura de Venta" : "Crear Nueva Factura de Venta"
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Bloque de última factura / sugerida */}
        {!initialData && lastInvoiceNumber && (
          <div className="p-2 bg-gray-100 rounded text-sm text-gray-700 space-y-1">
            <p>
              Última factura registrada: <b>{lastInvoiceNumber}</b>
            </p>
            {getNextInvoiceNumber(lastInvoiceNumber) && (
              <p>
                Siguiente sugerida:{" "}
                <b>{getNextInvoiceNumber(lastInvoiceNumber)}</b>
              </p>
            )}
          </div>
        )}

        {/* Encabezado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Tipo de Factura"
            value={tipoFactura}
            onChange={(e) => setTipoFactura(e.target.value)}
          >
            <option value="Electrónica">FV-1 Factura Electrónica</option>
            <option value="Física">FV-2 Documento Ingreso</option>
          </Select>
          <Select
            label="Cliente"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
          >
            <option value="">Seleccione un cliente</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} - {c.idNumber}
              </option>
            ))}
          </Select>
          <Input label="Vendedor" value={userData?.name || ""} readOnly />
          <Input
            label="Fecha"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Ítems */}
        <h4 className="text-md font-semibold pt-4 border-t">
          Ítems de la Factura
        </h4>
        <div className="grid grid-cols-14 gap-2 font-semibold text-gray-600 text-sm border-b pb-1">
          <div className="col-span-3">Producto</div>
          <div className="col-span-2">Cantidad</div>
          <div className="col-span-2">Valor Unitario</div>
          <div className="col-span-2">% Desc.</div>
          <div className="col-span-2">Impuesto</div>
          <div className="col-span-1">Ret.</div>
          <div className="col-span-1">Valor Total</div>
          <div className="w-8 flex justify-center"></div>
        </div>

        {items.map((item, index) => {
          const qty = Number(item.quantity) || 0;
          const price = Number(item.price) || 0;
          const desc = (Number(item.discount) || 0) / 100;
          const base = qty * price * (1 - desc);
          const taxRate = item.tax === "" ? 0 : Number(item.tax) / 100;
          const totalItem =
            base + base * taxRate - (Number(item.retention) || 0);

          return (
            <div key={index} className="grid grid-cols-14 gap-2 items-center">
              <div className="col-span-3">
                <Select
                  value={item.productId}
                  onChange={(e) =>
                    handleItemChange(index, "productId", e.target.value)
                  }
                >
                  <option value="">Seleccione producto</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  value={item.quantity}
                  min="1"
                  onChange={(e) =>
                    handleItemChange(index, "quantity", e.target.value)
                  }
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  value={item.price}
                  onChange={(e) =>
                    handleItemChange(index, "price", e.target.value)
                  }
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  value={item.discount}
                  onChange={(e) =>
                    handleItemChange(index, "discount", e.target.value)
                  }
                />
              </div>
              <div className="col-span-2">
                <Select
                  value={item.tax}
                  onChange={(e) =>
                    handleItemChange(index, "tax", e.target.value)
                  }
                >
                  <option value=""> </option>
                  <option value={0}>0% (Exento)</option>
                  <option value={5}>5%</option>
                  <option value={19}>19%</option>
                </Select>
              </div>
              <div className="col-span-1">
                <Input
                  type="number"
                  value={item.retention}
                  onChange={(e) =>
                    handleItemChange(index, "retention", e.target.value)
                  }
                />
              </div>
              <div className="col-span-1 text-right font-semibold">
                {new Intl.NumberFormat("es-CO").format(totalItem)}
              </div>
              <div className="w-8 flex justify-center items-center">
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700 p-1"
                  onClick={() => removeItem(index)}
                >
                  {icons.trash}
                </button>
              </div>
            </div>
          );
        })}

        <Button type="button" variant="secondary" onClick={addItem}>
          Añadir Ítem
        </Button>

        {/* Totales */}
        <div className="mt-4 border-t pt-4 space-y-2 text-right">
          <p>
            Subtotal: <b>${new Intl.NumberFormat("es-CO").format(subtotal)}</b>
          </p>
          <p>
            IVA: <b>${new Intl.NumberFormat("es-CO").format(iva)}</b>
          </p>
          <p>
            Retenciones:{" "}
            <b>-${new Intl.NumberFormat("es-CO").format(retenciones)}</b>
          </p>
          <p className="text-lg font-bold">
            Total Neto: ${new Intl.NumberFormat("es-CO").format(totalNeto)}
          </p>
        </div>

        {/* Forma de pago */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t pt-4">
          <Select
            label="Forma de Pago"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="Efectivo">Efectivo</option>
            <option value="Crédito">Crédito</option>
          </Select>
          <Input
            label="Observaciones"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {initialData ? "Actualizar Factura" : "Guardar Factura"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// --- Componente Principal de la App ---
export default function App() {
  return (
    <AppProvider>
      <Main />
    </AppProvider>
  );
}

const Main = () => {
  const { user, loading, error } = useApp();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50 p-4">
        <ErrorDisplay message={error} />
      </div>
    );
  }

  // Si el usuario está autenticado y no hay errores, muestra el layout. Si no, la pantalla de login/registro.
  // FIX: Se modifica la condición para que no dependa de `user.isAnonymous`
  return user ? <AppLayout /> : <AuthScreen />;
};
