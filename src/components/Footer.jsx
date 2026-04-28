import { Link } from 'react-router-dom';

const NAV_LINKS = [
  ['/', 'Início'], ['/como-funciona', 'Como Funciona'], ['/perdidos', 'Perdidos'],
  ['/achados', 'Achados'], ['/perdi-meu-pet', 'Perdi meu Pet'], ['/encontrei-um-pet', 'Encontrei um Pet'],
];

export default function Footer() {
  return (
    <footer style={{ background: '#1E1E1E', color: '#fff', paddingTop: '4rem', paddingBottom: '2rem' }}>
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 mb-10">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ background: 'var(--terra)' }}>🐾</div>
            <span className="font-display font-black text-2xl">
              Buscapet<span style={{ color: 'var(--sage)' }}>.com</span>
            </span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,.55)' }}>
            Plataforma gratuita para reunir pets e tutores. Feita com amor por quem ama animais.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: 'rgba(255,255,255,.8)' }}>Navegação</h4>
          <ul className="space-y-2">
            {NAV_LINKS.map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="text-sm no-underline transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,.5)' }}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: 'rgba(255,255,255,.8)' }}>Contato</h4>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,.5)' }}>contato@buscapet.com</p>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,.5)' }}>São Paulo, Brasil</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-6 text-center text-xs border-t" style={{ color: 'rgba(255,255,255,.25)', borderColor: 'rgba(255,255,255,.08)' }}>
        © 2025 Buscapet.com — Todos os direitos reservados. Feito com 🐾 e muito amor.
      </div>
    </footer>
  );
}
