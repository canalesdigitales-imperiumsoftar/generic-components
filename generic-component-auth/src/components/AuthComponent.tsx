import { ModalMessage } from './ModalMessage'; 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { EyeIcon, EyeOffIcon, Mail, Lock, User } from 'lucide-react';

export interface AuthLibraryProps {
  /** URL de tu Backend (ej: https://api.midominio.com) */
  backendUrl: string;
  /** URL de la plataforma actual (ej: https://cliente1.midominio.com) */
  platformURL: string;
  /** Callback que se ejecuta cuando el login es exitoso (recibe el objeto del usuario/token) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  processOnSuccess: (data: any) => void;
  /** Callback opcional para notificar acciones */
  onActionCompleted?: (action: 'login' | 'register' | 'forgot-password') => void;
  /** Logo opcional para mostrar arriba */
  logoUrl?: string;
}

export const AuthComponent: React.FC<AuthLibraryProps> = ({
  backendUrl,
  platformURL,
  processOnSuccess,
  onActionCompleted,
  logoUrl
}) => {
  // Estados de UI
  const [tab, setTab] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Estados de Datos
  const [formData, setFormData] = useState({ email: '', password: '', name: '', platformUrl: platformURL });
  
  // Estados del Modal
  const [modalMessage, setModalMessage] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [modalMessageOpen, setModalMessageOpen] = useState<any>(null);

  // -----------------------------------------------------------------------
  // 1. DETECTOR DE RETORNO DE GOOGLE (Token en URL)
  // -----------------------------------------------------------------------
  useEffect(() => {
    // Busca el token en los parámetros de la URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (token) {
      // Si hay token, limpiamos la URL visualmente
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Notificamos a la app padre
      onActionCompleted?.('login');
      // Pasamos el token. Dependiendo de tu backend, puede venir solo el string o un objeto.
      // Aquí asumo que devuelves un objeto { access_token: "..." }
      processOnSuccess({ access_token: token }); 
    } 
    
    if (error) {
       setErrorMessage('Ocurrió un error durante la autenticación externa.');
       window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [onActionCompleted, processOnSuccess]);

  // -----------------------------------------------------------------------
  // 2. MANEJO DE LOGIN CON GOOGLE (Redirección Centralizada)
  // -----------------------------------------------------------------------
  const handleGoogleRedirect = () => {
    setLoading(true);
    setErrorMessage(null);

    // Codificamos la URL de retorno en base64 para pasarla como 'state'
    // Esto permite que el backend sepa a qué subdominio volver.
    const stateData = JSON.stringify({ returnTo: platformURL });
    const encodedState = btoa(stateData);

    // Redirigimos al navegador hacia tu Backend
    // El backend iniciará el flujo OAuth con Google y usará 'state' para recordar este sitio.
    window.location.href = `${backendUrl}/auths/google?state=${encodedState}`;
  };

  // -----------------------------------------------------------------------
  // 3. LOGICA FORMULARIOS MANUALES (Login / Register / Recovery)
  // -----------------------------------------------------------------------
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    
    const endpoint = tab === 'login' ? 'login' : 'register';
    const url = `${backendUrl}/auths/${endpoint}`;

    try {
      const response = await axios.post(url, formData);

      if (tab === 'register') {
        setModalMessage('Cuenta creada con éxito. Revisa tu correo para verificar.');
        setModalMessageOpen(true);
        // No logueamos automáticamente en registro si requiere verificación de email
      } else {
        onActionCompleted?.('login');
        processOnSuccess(response.data);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.message || 'Error de conexión con el servidor.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
      // Si fue registro exitoso, volvemos al login
      if (tab === 'register' && !errorMessage) setTab('login');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    try {
      await axios.post(`${backendUrl}/auths/forgot-password`, { 
        email: formData.email, 
        platformURL: platformURL 
      });
      onActionCompleted?.('forgot-password');
      setModalMessage('Si el correo existe, recibirás un enlace de recuperación en breve.');
      setModalMessageOpen(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Error al solicitar recuperación.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalMessageOpen(false);
    if (tab === 'register') setTab('login');
  };

  // -----------------------------------------------------------------------
  // RENDERIZADO
  // -----------------------------------------------------------------------
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <ModalMessage 
        modalMessageOpen={modalMessageOpen} 
        onClick={closeModal} 
        modalMessage={modalMessage}
      />
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header con Logo opcional */}
        <div className="bg-gray-50 p-6 text-center border-b border-gray-100">
          {logoUrl && <img src={logoUrl} alt="Logo" className="h-12 mx-auto mb-4" />}
          <h2 className="text-2xl font-bold text-gray-800">
            {tab === 'login' && 'Bienvenido de nuevo'}
            {tab === 'register' && 'Crea tu cuenta'}
            {tab === 'forgot-password' && 'Recuperar acceso'}
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            {tab === 'login' && 'Ingresa tus credenciales para continuar'}
            {tab === 'register' && 'Únete a nosotros en segundos'}
            {tab === 'forgot-password' && 'Te enviaremos las instrucciones'}
          </p>
        </div>

        <div className="p-8">
          {/* Tabs Selector */}
          {tab !== 'forgot-password' && (
            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
              {(['login', 'register'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setErrorMessage(null); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    tab === t ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
                </button>
              ))}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
              {errorMessage}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={tab === 'forgot-password' ? handleForgotPassword : handleManualSubmit} className="space-y-4">
            
            {/* Nombre (Solo registro) */}
            {tab === 'register' && (
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre completo"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            {/* Password (Login y Registro) */}
            {tab !== 'forgot-password' && (
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Contraseña"
                    required
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                {tab === 'login' && (
                  <div className="text-right mt-2">
                    <button
                      type="button"
                      onClick={() => setTab('forgot-password')}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition duration-200 shadow-lg shadow-blue-500/30 flex justify-center items-center ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {tab === 'login' && 'Ingresar'}
                  {tab === 'register' && 'Crear Cuenta'}
                  {tab === 'forgot-password' && 'Enviar enlace'}
                </>
              )}
            </button>

            {tab === 'forgot-password' && (
              <button
                type="button"
                onClick={() => setTab('login')}
                className="w-full text-sm text-gray-500 hover:text-gray-800 font-medium mt-4"
              >
                Volver al inicio de sesión
              </button>
            )}
          </form>

          {/* Separador y Google Login */}
          {tab !== 'forgot-password' && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">O continúa con</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleRedirect}
                disabled={loading}
                className="w-full py-3 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition duration-200 flex items-center justify-center gap-3"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                Google
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};