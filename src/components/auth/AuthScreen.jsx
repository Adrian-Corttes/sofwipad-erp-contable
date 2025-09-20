
import React, { useState } from "react";
import {
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  collection,
  addDoc,
  doc,
  setDoc,
  serverTimestamp,
} from "../../lib/firebase";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ErrorDisplay from "../ui/ErrorDisplay";
import SuccessDisplay from "../ui/SuccessDisplay";

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [nit, setNit] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");
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
    setSuccessMessage("");
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

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage("Se ha enviado un correo de restablecimiento de contraseña a tu dirección de correo electrónico.");
      setEmail("");
      setShowPasswordReset(false);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
    setTimeout(() => setSuccessMessage(""), 5000);
    setTimeout(() => setError(""), 5000);
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
            {!showPasswordReset ? (
              <>
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
              </>
            ) : (
              <Input
                id="emailReset"
                name="emailReset"
                type="email"
                label="Correo Electrónico"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}

            <ErrorDisplay message={error} />
            <SuccessDisplay message={successMessage} />

            <div>
              {!showPasswordReset ? (
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
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  className="w-full"
                  onClick={handlePasswordReset}
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Enviar correo de restablecimiento"}
                </Button>
              )}
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
              {!showPasswordReset && isLogin && (
                <button
                  onClick={() => {
                    setShowPasswordReset(true);
                    setError("");
                    setSuccessMessage("");
                  }}
                  className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline mr-4"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setSuccessMessage("");
                  setShowPasswordReset(false);
                }}
                className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
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

export default AuthScreen;
