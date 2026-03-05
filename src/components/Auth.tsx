import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Loader2, FileText, ArrowLeft } from 'lucide-react';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { login, signup, forgotPassword, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isResetPassword) {
        await resetPassword(resetToken, newPassword);
        setMessage('Contraseña restablecida con éxito. Ahora puedes iniciar sesión.');
        setIsResetPassword(false);
        setIsLogin(true);
      } else if (isForgotPassword) {
        const data = await forgotPassword(email);
        setMessage(`Se ha enviado un enlace de recuperación a ${email}. (Token de prueba: ${data.debug_token})`);
        setIsResetPassword(true);
        setIsForgotPassword(false);
      } else if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-100">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">DocuGen</h1>
          <p className="text-gray-500 mt-2 font-medium">
            {isResetPassword ? 'Establecer nueva contraseña' : isForgotPassword ? 'Recuperar contraseña' : isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold rounded-2xl">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-bold rounded-2xl">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isResetPassword ? (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Token de Recuperación</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="Ingresa el token recibido"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nueva Contraseña</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="tu@correo.com"
                    />
                  </div>
                </div>

                {!isForgotPassword && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Contraseña</label>
                    <div className="relative">
                      <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isResetPassword ? (
                'Restablecer Contraseña'
              ) : isForgotPassword ? (
                'Enviar Enlace'
              ) : isLogin ? (
                'Iniciar Sesión'
              ) : (
                'Registrarse'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-4 text-center">
            {isForgotPassword || isResetPassword ? (
              <button
                onClick={() => {
                  setIsForgotPassword(false);
                  setIsResetPassword(false);
                  setIsLogin(true);
                }}
                className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Volver al inicio
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm font-bold text-gray-500 hover:text-gray-700"
                >
                  {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                </button>
                {isLogin && (
                  <button
                    onClick={() => setIsForgotPassword(true)}
                    className="text-sm font-bold text-blue-600 hover:text-blue-700"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
