import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import DashboardPaciente from './pages/Paciente/DashboardPaciente'
import DashboardProfissional from './pages/Profissional/DashboardProfissional'
import Educacao from './pages/Educacao/Educacao'
import ScrollToTop from './components/ScrollToTop'

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rotas Privadas */}
        <Route path="/paciente" element={<DashboardPaciente />} />
        <Route path="/profissional" element={<DashboardProfissional />} />
        <Route path="/educacao" element={<Educacao />} />

        {/* Catch all route - redireciona para login se rota não existir */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App

