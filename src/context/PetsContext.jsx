// ═══════════════════════════════════════════════════════
// context/PetsContext.jsx — Estado global dos pets
// ═══════════════════════════════════════════════════════
import { createContext, useContext, useState, useCallback } from 'react';
import { DEMO_PETS, computeMatches } from '../utils/constants';
import { petsAPI } from '../services/api';

const PetsContext = createContext(null);

export function PetsProvider({ children }) {
  const [pets, setPets]       = useState([...DEMO_PETS]);
  const [loading, setLoading] = useState(false);

  const fetchPets = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await petsAPI.list(params);
      setPets(data);
    } catch {
      // fallback: mantém os dados demo se API offline
    } finally {
      setLoading(false);
    }
  }, []);

  const addPet = useCallback((pet) => {
    setPets(prev => [pet, ...prev]);
  }, []);

  const removePet = useCallback((id) => {
    setPets(prev => prev.filter(p => p.id !== id));
  }, []);

  const matches = computeMatches(pets);

  return (
    <PetsContext.Provider value={{ pets, loading, fetchPets, addPet, removePet, matches }}>
      {children}
    </PetsContext.Provider>
  );
}

export function usePets() {
  const ctx = useContext(PetsContext);
  if (!ctx) throw new Error('usePets deve ser usado dentro de PetsProvider');
  return ctx;
}
