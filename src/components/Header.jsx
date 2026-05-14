import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, isLogged, logout } = useAuth();
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [dropOpen,    setDropOpen]    = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fecha menus ao navegar
  useEffect(() => { setMobileOpen(false); setDropOpen(false); }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/como-funciona', label: 'Como Funciona' },
    { to: '/perdidos',      label: 'Perdidos'       },
    { to: '/achados',       label: 'Achados'        },
    { to: '/matches',       label: 'Matches'     },
  ];

  const init = user
    ? `${(user.first_name || '?')[0]}${(user.last_name || '')[0] || ''}`.toUpperCase()
    : '';

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: 'rgba(250,245,236,.93)',
        backdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(237,229,208,.7)',
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,.07)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between" style={{ height: 68 }}>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group no-underline">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl text-white group-hover:scale-110 transition-transform"
            style={{ background: 'var(--terra)', boxShadow: '0 4px 14px rgba(194,91,42,.3)' }}
          >🐾</div>
          <span className="font-display font-black text-2xl" style={{ color: 'var(--terra)' }}>
            Buscapet<span style={{ color: 'var(--sage)' }}>.com</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to} to={to}
              className={`text-sm font-medium uppercase tracking-wider transition-colors no-underline ${
                isActive(to) ? 'font-semibold' : 'text-charcoal-soft hover:text-terra'
              }`}
              style={isActive(to) ? { color: 'var(--terra)' } : {}}
            >{label}</Link>
          ))}
          <Link to="/perdi-meu-pet"    className="btn btn-terra btn-sm">Perdi meu pet</Link>
          <Link to="/encontrei-um-pet" className="btn btn-outline-sage btn-sm">Encontrei um pet</Link>

          {/* User slot */}
          {!isLogged ? (
            <div className="flex items-center gap-2">
              <Link to="/auth" className="btn btn-outline-terra btn-sm">Entrar</Link>
              <Link to="/auth?tab=register" className="btn btn-terra btn-sm">Cadastrar</Link>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setDropOpen(o => !o)}
                className="flex items-center gap-2 rounded-full pl-2.5 pr-3.5 py-1.5 transition-all border"
                style={{ background: 'var(--cream-dark)', borderColor: 'var(--cream-dark)' }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: 'var(--terra)' }}>{init}</div>
                <span className="text-sm font-semibold text-charcoal max-w-[90px] truncate">{user?.first_name}</span>
                <svg className={`w-3.5 h-3.5 text-charcoal-soft transition-transform ${dropOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border overflow-hidden z-50" style={{ borderColor: 'var(--cream-dark)' }}>
                  <div className="px-4 py-3 border-b" style={{ background: 'var(--cream)', borderColor: 'var(--cream-dark)' }}>
                    <div className="font-semibold text-sm text-charcoal">{user?.first_name} {user?.last_name}</div>
                    <div className="text-xs text-charcoal-soft truncate">{user?.email}</div>
                  </div>
                  <div className="py-1">
                    <Link to="/meus-pets" className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal hover:bg-cream transition-colors no-underline">🐾 Meus cadastros</Link>
                    <Link to="/perfil"    className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal hover:bg-cream transition-colors no-underline">👤 Meu perfil</Link>
                  </div>
                  <div className="border-t py-1" style={{ borderColor: 'var(--cream-dark)' }}>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors text-left">🚪 Sair</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 text-charcoal" onClick={() => setMobileOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden px-6 py-4 space-y-2 shadow-lg border-t" style={{ background: 'var(--cream)', borderColor: 'var(--cream-dark)' }}>
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} className="block text-sm font-medium py-1.5 text-charcoal-soft hover:text-terra no-underline">{label}</Link>
          ))}
          <Link to="/perdi-meu-pet"    className="btn btn-terra w-full justify-center mt-1 block text-center">Perdi meu pet</Link>
          <Link to="/encontrei-um-pet" className="btn btn-outline-sage w-full justify-center block text-center">Encontrei um pet</Link>
          {!isLogged ? (
            <div className="space-y-2 pt-1">
              <Link to="/auth" className="btn btn-terra w-full justify-center block text-center">Entrar</Link>
              <Link to="/auth?tab=register" className="btn btn-outline-terra w-full justify-center block text-center">Criar conta</Link>
            </div>
          ) : (
            <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--cream-dark)' }}>
              <div className="flex items-center gap-3 py-1">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-white" style={{ background: 'var(--terra)' }}>{init}</div>
                <div>
                  <div className="font-semibold text-sm">{user?.first_name} {user?.last_name}</div>
                  <div className="text-xs text-charcoal-soft">{user?.email}</div>
                </div>
              </div>
              <Link to="/meus-pets" className="block text-sm py-1 text-charcoal no-underline">Meus cadastros</Link>
              <Link to="/perfil"    className="block text-sm py-1 text-charcoal no-underline">Perfil</Link>
              <button onClick={handleLogout} className="block text-sm py-1 text-red-500 text-left w-full" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Sair</button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
