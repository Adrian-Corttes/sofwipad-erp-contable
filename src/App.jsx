
import React from "react";
import { Toaster } from "react-hot-toast";
import { AppProvider, useApp } from "./context/AppContext";
import AuthScreen from "./components/auth/AuthScreen";
import AppLayout from "./components/layout/AppLayout";
import Spinner from "./components/ui/Spinner";
import ErrorDisplay from "./components/ui/ErrorDisplay";

const AppContent = () => {
  const { user, loading, error } = useApp();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <ErrorDisplay message={error} />
      </div>
    );
  }

  return user ? <AppLayout /> : <AuthScreen />;
};

const App = () => {
  return (
    <AppProvider>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
        }}
      />
      <AppContent />
    </AppProvider>
  );
};

export default App;
