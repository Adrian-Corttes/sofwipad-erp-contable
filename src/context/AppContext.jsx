
import React, { useState, useEffect, createContext, useContext } from "react";
import {
  auth,
  db,
  onAuthStateChanged,
  signOut,
  doc,
  getDoc,
  collection,
  query,
  limit,
  getDocs,
  writeBatch,
} from "../lib/firebase";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
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

    const unsubscribe = onAuthStateChanged(auth, authAndSetup);

    return () => unsubscribe();
  }, []);

  const value = { user, userData, companyData, loading, error, setError };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
