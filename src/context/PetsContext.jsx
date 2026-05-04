// ═══════════════════════════════════════════════════════
// context/PetsContext.jsx — Estado global dos pets
// ═══════════════════════════════════════════════════════
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { computeMatches } from '../utils/constants';
import { petsAPI } from '../services/api';

const PetsContext = createContext(null);

// Normaliza campos vindos do MySQL para o padrão esperado pelo frontend
function normalizePet(p) {
  if (!p || typeof p !== 'object') return null;
  return {
    ...p,
    // Garante que type seja sempre 'lost' ou 'found'
    type: p.type === 'perdido' ? 'lost'
        : p.type === 'achado'  ? 'found'
        : p.type ?? '',
    // Garante strings ou null nos campos de texto usados pelo matching
    breed:       p.breed       ?? null,
    color:       p.color       ?? null,
    size:        p.size        ?? null,
    gender:      p.gender      ?? null,
    location:    p.location    ?? null,
    date:        p.date        ?? null,
    species:     p.species     ?? null,
    description: p.description ?? '',
    name:        p.name        ?? null,
    photo:       p.photo       ?? null,
    created_at:  p.created_at  ?? null,
  };
}

export function PetsProvider({ children }) {
  const [pets, setPets]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchPets = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await petsAPI.list(params);
      // Aceita tanto array direto quanto { pets: [...] }
      const raw = Array.isArray(data) ? data : (data?.pets ?? []);
      setPets(raw.map(normalizePet).filter(Boolean));
    } catch (err) {
      console.error('[PetsContext] Erro ao buscar pets:', err);
      setError('Não foi possível carregar os dados. Verifique se o servidor está rodando.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carrega automaticamente ao montar o app
  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const addPet = useCallback((pet) => {
    setPets(prev => [normalizePet(pet), ...prev].filter(Boolean));
  }, []);

  const removePet = useCallback((id) => {
    setPets(prev => prev.filter(p => p.id !== id));
  }, []);

  const matches = computeMatches(pets);

  return (
    <PetsContext.Provider value={{ pets, loading, error, fetchPets, addPet, removePet, matches }}>
      {children}
    </PetsContext.Provider>
  );
}

export function usePets() {
  const ctx = useContext(PetsContext);
  if (!ctx) throw new Error('usePets deve ser usado dentro de PetsProvider');
  return ctx;
}
