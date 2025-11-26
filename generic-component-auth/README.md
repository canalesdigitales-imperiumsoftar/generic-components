# Generic Auth Component

Librería de componentes React reutilizable para autenticación unificada (Login Manual + Google OAuth). Diseñada para integrarse con backends que soporten redirección OAuth dinámica.

## 📦 Instalación

```bash
npm install generic-component-auth
```
### 🚀 Configuración
##### 1 Importar Estilos
Es obligatorio importar los estilos CSS en el archivo principal de tu aplicación (ej: App.tsx o main.tsx):
```bash
import "generic-component-auth/dist/style.css";
```
##### 2. Uso del Componente
```bash

import { AuthComponent } from 'generic-component-auth';

const LoginPage = () => {

  const handleSuccess = (data) => {
    // data contiene { access_token: "..." } o el objeto usuario completo
    console.log("Login exitoso:", data);
  };

  return (
    <div className="login-wrapper">
      <AuthComponent 
        backendUrl="https://api.tu-dominio.com"
        platformURL={window.location.origin + '/login'}
        processOnSuccess={handleSuccess}
        logoUrl="/assets/logo.png"
      />
    </div>
  );
};
```
##### ⚙️ Propiedades (Props)
backendUrl (string, requerido): La URL base de tu API (donde corren los endpoints de auth).
platformURL (string, requerido): La URL completa de tu Frontend actual. Se usa para que Google sepa dónde devolver al usuario.
processOnSuccess (function, requerido): Callback que se ejecuta cuando el login es exitoso.
logoUrl (string, opcional): Ruta de la imagen para mostrar arriba del formulario.
onActionCompleted (function, opcional): Callback para saber si el usuario cambió de tab (login/register).

##### 📡 Requisitos del Backend
Para que el login funcione, tu API debe tener estos endpoints:
POST /auths/login
Recibe: { email, password, platformUrl }
Devuelve: JSON con usuario y token.
GET /auths/google
Debe iniciar el flujo OAuth.
Debe leer el query param state (que contiene la URL de retorno).
GET /auths/profile (Importante para Google Login)
Debe aceptar Authorization: Bearer <token>.
Devuelve los datos completos del usuario. Esto es necesario porque Google solo devuelve el token en la URL.

##### 💡 Integración con React Admin
Si usas react-admin, agrega esto a tu authProvider.checkAuth para capturar el token de Google automáticamente:
```bash
checkAuth: async () => {
    // 1. Verificar si hay cookie de sesión
    if (Cookies.get('accesToken')) return Promise.resolve();

    // 2. Verificar si volvemos de Google (Token en URL)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
        // Loguear usando el token de la URL
        await authProvider.login({ access_token: token });
        // Limpiar la barra de direcciones
        window.history.replaceState({}, document.title, window.location.pathname);
        return Promise.resolve();
    }

    return Promise.reject();
}
```