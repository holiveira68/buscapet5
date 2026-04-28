// ═══════════════════════════════════════════════════════
// hooks/useToast.jsx — Hook de notificações toast
// ═══════════════════════════════════════════════════════
import { useState, useCallback } from 'react';

let _toast = null; // referência global para uso fora de componentes

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((icon, msg, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, icon, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  _toast = toast;
  return { toasts, toast };
}

// Uso fora de componentes: toast('✅', 'mensagem', 'success')
export function toast(icon, msg, type = 'info') {
  if (_toast) _toast(icon, msg, type);
}

export function ToastContainer({ toasts }) {
  const borderColor = (type) =>
    type === 'success' ? '#22C55E' : type === 'error' ? '#EF4444' : '#F5A623';

  return (
    <div id="toast-container" className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className="toast-item"
          style={{ borderLeftColor: borderColor(t.type) }}
        >
          <span className="text-xl flex-shrink-0">{t.icon}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
