import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import React, { useState } from 'react';
import axios from 'axios';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { ModalMessage } from '../Components/ModalMessage';
interface GoogleLoginWrapperProps {
  processOnSuccess: (data: any) => void;
  backendUrl: string;
  onActionCompleted?: (action: 'login' | 'register' | 'forgot-password') => void;
  platformURL: string;
}

export const GoogleLoginWrapper: React.FC<GoogleLoginWrapperProps> = ({
  processOnSuccess,
  backendUrl,
  onActionCompleted,
  platformURL
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '', platformUrl: platformURL });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalMessageOpen, setModalMessageOpen] = useState<any>(null);

  const loginWithGoogle = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async ({ code }) => {
      setLoading(true);
      try {
        const response = await axios.post(`${backendUrl}/auths/google`, { data: code });
        onActionCompleted?.('login');
        processOnSuccess(response.data);
      } catch (error) {
        setErrorMessage('Error al iniciar sesión con Google. Inténtalo nuevamente.');
        console.error(error);
      }finally {
        setLoading(false);
        setTab('login');
      }
    },
    onError: (error) => {
      setErrorMessage('Error al iniciar sesión con Google.');
      console.error(error);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const url = `${backendUrl}/auths/${tab === 'login' ? 'login' : 'register'}`;

    try {
      const response = await axios.post(url, formData);
      if (tab === 'register') {
        setModalMessage('Revisa tu correo para continuar con el proceso de Registración.');
        setModalMessageOpen(true);
      }
      onActionCompleted?.(tab === 'login' ? 'login' : 'register');
      processOnSuccess(response.data);
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Error al procesar la solicitud.';
      setErrorMessage(msg);
    }finally {
    setLoading(false);
    setTab('login');
  }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      onActionCompleted?.("forgot-password");
      await axios.post(`${backendUrl}/auths/forgot-password`, { email: formData.email, platformURL: platformURL });
      setModalMessage('Revisa tu correo para continuar con el proceso de recuperación de tu  contraseña. Dura 10 Minutos.');
      setModalMessageOpen(true);
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'No se pudo enviar el correo de recuperación.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
      setTab('login');
    }
  };

  const onclickModalMessage = () => {
    setModalMessageOpen(false);
    setTab('login');
    setErrorMessage(null);
  };

  return (
    <section className="bg-white min-h-screen flex items-center justify-center">
      <ModalMessage modalMessageOpen={modalMessageOpen} onClick={onclickModalMessage} modalMessage={modalMessage}/>
      <div className="w-full max-w-md bg-gray-100 p-8 rounded-2xl shadow-lg">
        {/* Tabs */}
        <div className="flex justify-center mb-4 space-x-4">
          {['login', 'register'].map(mode => (
            <button
              key={mode}
              onClick={() => setTab(mode as any)}
              className={`px-4 py-2 font-semibold text-sm rounded-t-lg ${
                tab === mode ? 'bg-white text-[#002D74]' : 'text-gray-500'
              }`}
            >
              {mode === 'login' ? 'Login' : 'Register'}
            </button>
          ))}
        </div>

        {tab === 'login' && (
          <div className="text-sm text-right mb-2">
            <button
              className="text-blue-500 hover:underline"
              onClick={() => setTab('forgot-password')}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        )}

        {/* Título */}
        <h2 className="text-2xl font-bold text-center text-[#002D74] mb-2">
          {{
            login: 'Iniciar sesión',
            register: 'Crear cuenta',
            'forgot-password': 'Recuperar contraseña',
          }[tab]}
        </h2>

        {/* Subtítulo */}
        <p className="text-sm text-center text-[#002D74] mb-4">
          {{
            login: 'Ingresa con tu email y contraseña',
            register: 'Crea una nueva cuenta con tus datos',
            'forgot-password': 'Ingresa tu correo electrónico para recuperar tu contraseña',
          }[tab]}
        </p>
        {/* Mensaje de error */}
        {errorMessage && (
          <p className="text-red-500 text-sm text-center mb-4">{errorMessage}</p>
        )}

        {/* Formularios */}
        {tab !== 'forgot-password' ? (
          <form className="flex flex-col gap-4" onSubmit={handleFormSubmit}>
            {tab === 'register' && (
              <input
                className="p-3 rounded-xl border"
                type="text"
                name="name"
                placeholder="Nombre"
                value={formData.name}
                onChange={handleInputChange}
              />
            )}

            <input
              className="p-3 rounded-xl border"
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleInputChange}
            />

            <div className="relative">
              <input
                className="p-3 rounded-xl border w-full pr-10"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleInputChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
              >
                {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
              </button>
            </div>

            <button
              disabled={loading}
              className={`bg-[#002D74] text-white rounded-xl py-2 hover:scale-105 transition duration-300 ${
                loading ? 'opacity-50 cursor-not-allowed' : '' } `}
              type="submit"
            >
              {loading
                ? 'Procesando...'
                : tab === 'login'
                ? 'Iniciar sesión'
                : 'Registrarse'}
            </button>
          </form>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleForgotPassword}>
            <input
              className="p-3 rounded-xl border"
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleInputChange}
            />
            <button
              disabled={loading}
              className={`bg-[#002D74] text-white rounded-xl py-2 hover:scale-105 transition duration-300 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              type="submit"
            >
              Enviar enlace de recuperación
            </button>
            <div className="text-sm text-center mt-2">
              <button
                className="text-blue-500 hover:underline"
                onClick={() => setTab('login')}
              >
                Volver al inicio de sesión
              </button>
            </div>
          </form>
        )}

        {/* Separador */}
        <div className="mt-6 flex items-center text-gray-400 gap-2">
          <hr className="flex-grow border-gray-300" />
          <span className="text-sm">O</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Botón de Google */}
        <button
          onClick={() => !loading && loginWithGoogle()}
          disabled={loading}
          className={`mt-5 bg-white border py-2 w-full rounded-xl flex justify-center items-center text-sm hover:scale-105 transition duration-300 text-[#002D74] ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google Logo"
            className="w-5 h-5 mr-3"
          />
          Continuar con Google
        </button>
      </div>
    </section>
  );
};

interface GoogleLoginProviderProps {
  children: React.ReactNode;
  clientId: string;
}

export const GoogleLoginProvider: React.FC<GoogleLoginProviderProps> = ({
  children,
  clientId,
}) => {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
};
