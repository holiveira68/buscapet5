import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PetsProvider } from './context/PetsContext'
import { useToast, ToastContainer } from './hooks/useToast'
import { AuthGuard } from './components/PetCard'
import Header from './components/Header'
import Footer from './components/Footer'

import Home         from './pages/Home'
import ComoFunciona from './pages/ComoFunciona'
import PetList      from './pages/PetList'
import PetDetail    from './pages/PetDetail'
import PetForm      from './pages/PetForm'
import Auth         from './pages/Auth'
import { MeusPets } from './pages/MeusPets'
import { Perfil }   from './pages/MeusPets'

function Layout() {
  const { toasts } = useToast()
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pt-[68px]">
        <Routes>
          <Route path="/"                 element={<Home />} />
          <Route path="/como-funciona"    element={<ComoFunciona />} />
          <Route path="/perdidos"         element={<PetList type="lost" />} />
          <Route path="/achados"          element={<PetList type="found" />} />
          <Route path="/pet/:id"          element={<PetDetail />} />
          <Route path="/auth"             element={<Auth />} />
          <Route path="/perdi-meu-pet"    element={<AuthGuard><PetForm type="lost"  /></AuthGuard>} />
          <Route path="/encontrei-um-pet" element={<AuthGuard><PetForm type="found" /></AuthGuard>} />
          <Route path="/meus-pets"        element={<AuthGuard><MeusPets /></AuthGuard>} />
          <Route path="/perfil"           element={<AuthGuard><Perfil /></AuthGuard>} />
          <Route path="*"                 element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer toasts={toasts} />
    </div>
  )
}

function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center text-center px-6">
      <div>
        <div className="text-8xl mb-6">🐾</div>
        <h1 className="font-display font-black text-4xl text-charcoal mb-3">Página não encontrada</h1>
        <p className="text-charcoal-soft mb-8">Essa página não existe ou foi movida.</p>
        <a href="/" className="btn btn-terra btn-lg">Voltar ao início</a>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PetsProvider>
          <Layout />
        </PetsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
