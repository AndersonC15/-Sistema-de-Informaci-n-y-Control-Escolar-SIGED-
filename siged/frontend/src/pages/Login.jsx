import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [numeroIdentificacion, setNumeroIdentificacion] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!numeroIdentificacion.trim() || !password.trim()) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    setLoading(true);
    try {
      await login(numeroIdentificacion.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        'Error al iniciar sesión. Verifique sus credenciales.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col md:flex-row bg-background font-['Inter'] text-gray-800 antialiased overflow-x-hidden">
      <section className="w-full md:w-1/2 min-h-[409px] md:min-h-screen bg-primary flex flex-col items-center justify-center p-8 md:p-16 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col items-center text-center max-w-md">
          <div className="w-full max-w-[320px] md:max-w-[420px] mb-8 drop-shadow-2xl">
            <img
              alt="Sistema de Información y Gestión Educativa"
              className="w-full h-auto object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYd5HcUYH2gi2PHSBd6DXciufS_e4-aPNwJYpYq_MRrWADHtUVeRM-V-h94MyQiarTsWYIqxfSJst_jUAgLK4VqKylQzapnpk9gYK8elu_hfmwN15FvmOqerhnw6CTQA9P3d1R8uUO1pkKk2CT0qgFDvbdIPunnTL8LQal-cbRIScaaj04CXH1efEem6PFxBfzjM0D0ovS24TR1hrpIe77HqRUJQAD-bXSohDjmndQYzCHKkJgpIq_S8mYTTWz97f5FXjNokA74KIo"
            />
          </div>
          <h1 className="text-white italic font-['Manrope'] text-lg md:text-2xl leading-relaxed tracking-wide opacity-90">
            Sistema de Información y Gestión Educativa (SIGED)
          </h1>
        </div>
      </section>

      <section className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-surface">
        <div className="w-full max-w-md space-y-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-1 bg-primary rounded-full"></div>
              <span className="text-primary font-['Manrope'] font-extrabold text-3xl tracking-tight">SIGED</span>
            </div>
            <p className="text-gray-500 font-medium text-lg">
              Ingrese sus credenciales para acceder al sistema
            </p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block font-bold text-gray-800 text-sm uppercase tracking-wider" htmlFor="id-number">
                Número de identificación <span className="text-danger">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <input
                  className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-gray-800 placeholder:text-gray-500/60"
                  id="id-number"
                  name="id-number"
                  placeholder="Ingresa su número de identificación"
                  type="text"
                  value={numeroIdentificacion}
                  onChange={(e) => setNumeroIdentificacion(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-gray-800 text-sm uppercase tracking-wider" htmlFor="password">
                Contraseña <span className="text-danger">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <input
                  className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-gray-800 placeholder:text-gray-500/60"
                  id="password"
                  name="password"
                  placeholder="Ingresa su contraseña"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                className="w-full flex items-center justify-center gap-3 py-4 bg-primary hover:brightness-90 text-white font-['Manrope'] font-bold text-lg rounded-full shadow-lg shadow-primary/20 active:scale-[0.98] transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {loading ? 'Ingresando...' : 'Ingresar al sistema'}
              </button>
            </div>
          </form>
        </div>
      </section>

      <footer className="w-full py-6 px-8 bg-background text-center md:absolute md:bottom-0 md:right-0 md:w-1/2">
        <p className="text-xs text-gray-500 font-['Inter'] uppercase tracking-widest">@ 2026 SIGED</p>
      </footer>
    </main>
  );
}
