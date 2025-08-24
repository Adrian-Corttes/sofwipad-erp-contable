<!-- Logo SVG inline -->
<p align="center">
  <svg width="280" height="80" viewBox="0 0 560 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label=" Sofwipad ERP Contable">
    <title>Sofwipad ERP Contable</title>
    <!-- Isotipo: barras + caja (inventario) -->
    <g transform="translate(20,20)">
      <rect x="0" y="40" width="24" height="60" rx="4" fill="currentColor" opacity="0.25"/>
      <rect x="36" y="20" width="24" height="80" rx="4" fill="currentColor" opacity="0.45"/>
      <rect x="72" y="0"  width="24" height="100" rx="4" fill="currentColor" opacity="0.80"/>
      <rect x="108" y="28" width="44" height="44" rx="8" fill="none" stroke="currentColor" stroke-width="6"/>
      <path d="M108 50h44" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
      <path d="M130 28v44" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
    </g>
    <!-- Logotipo -->
    <g transform="translate(190,35)" fill="currentColor">
      <text x="0" y="40" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, Apple Color Emoji, Segoe UI Emoji" font-size="42" font-weight="800" letter-spacing="0.5">ERP Contable</text>
      <text x="2" y="70" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, Apple Color Emoji, Segoe UI Emoji" font-size="18" opacity="0.7">React + Firebase • Firestore en tiempo real</text>
    </g>
  </svg>
</p>

<h1 align="center">ERP Contable - React + Firebase</h1>

Aplicación ERP contable desarrollada con **React** y **Firebase**.  
Permite gestionar empresas, usuarios, ventas, compras, inventario y reportes en tiempo real con Firestore.  
Incluye autenticación, plan de cuentas automático y módulos personalizables.

---

## 🚀 Características principales
- 🔐 Autenticación de usuarios (registro e inicio de sesión).
- 🏢 Gestión de empresas y usuarios.
- 📊 Dashboard con KPIs y reportes financieros.
- 💵 Módulo de ventas y facturación.
- 🛒 Módulo de compras.
- 📦 Inventario en tiempo real.
- 📝 Plan de cuentas contables automático.
- ⚡ Integración completa con Firebase Firestore.

---

## 🛠️ Tecnologías utilizadas
- React  
- Firebase Authentication  
- Cloud Firestore  
- Tailwind CSS para estilos  

---

## 📦 Instalación y uso

1. **Clonar el repositorio**  
   ```bash
   git clone https://github.com/tuusuario/erp-contable.git
   cd erp-contable
   ```

2. **Instalar dependencias**  
   ```bash
   npm install
   ```

3. **Configurar Firebase** en un archivo `.env` (no se sube al repo, solo es local).  
   Ejemplo de configuración:
   ```env
   REACT_APP_FIREBASE_API_KEY=xxxx
   REACT_APP_FIREBASE_AUTH_DOMAIN=xxxx
   REACT_APP_FIREBASE_PROJECT_ID=xxxx
   REACT_APP_FIREBASE_STORAGE_BUCKET=xxxx
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=xxxx
   REACT_APP_FIREBASE_APP_ID=xxxx
   ```

4. **Iniciar en modo desarrollo**  
   ```bash
   npm start
   ```

---

## 📌 Próximas mejoras
- 📑 Módulo de reportes avanzados.  
- 💳 Integración con pasarelas de pago.  
- 📈 Visualización de gráficos financieros.  
- 👥 Control de roles y permisos más detallado.  

---

## 📜 Aviso de uso
Este proyecto es propiedad de Sofwipad.
Está destinado a fines **comerciales** y no cuenta con una licencia pública.

**No está permitido copiar, modificar ni distribuir el código sin autorización expresa del autor**.  

© 2025 **Sofwipad**
