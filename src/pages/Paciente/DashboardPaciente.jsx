import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LogOut, PlusCircle, Activity, FileText } from 'lucide-react';
import NovaSolicitacao from './NovaSolicitacao';
import ListaChamados from './ListaChamados';
import ThemeToggle from '../../components/ThemeToggle';
import ToastContainer, { useToast } from '../../components/Toast';

export default function DashboardPaciente() {
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('lista'); // 'lista' ou 'nova'
  const navigate = useNavigate();
  const actionRowRef = useRef(null);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/');
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (data && data.type !== 'paciente') {
      navigate(`/${data.type}`);
    } else {
      setProfile(data || { name: 'Paciente' });
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/');
  }

  const handleViewChange = (newView) => {
    setView(newView);
    setTimeout(() => {
      if (actionRowRef.current) {
        actionRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const handleSolicitacaoSucesso = () => {
    handleViewChange('lista');
    addToast('Solicitação enviada com sucesso! Um profissional irá analisar em breve.', 'success');
  };

  if (!profile) {
    return (
      <div className="layout-container">
        <header className="app-header">
          <div>
            <div className="skeleton skeleton-line" style={{ width: '140px', height: '1.2rem' }} />
            <div className="skeleton skeleton-line short" style={{ marginTop: '0.5rem', height: '0.9rem' }} />
          </div>
        </header>
        <main className="main-content">
          <div className="skeleton-card skeleton" style={{ height: '64px', marginBottom: '1.5rem' }} />
          <div className="skeleton-card skeleton" style={{ height: '200px' }} />
        </main>
      </div>
    );
  }

  return (
    <div className="layout-container">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <header className="app-header">
        <div>
          <h1 className="header-title">Olá, {profile.name}</h1>
          <p className="header-subtitle">Como podemos ajudar você hoje?</p>
        </div>
        <div className="header-actions">
          <ThemeToggle />
          <button onClick={handleLogout} className="btn-icon" aria-label="Sair">
            <LogOut size={24} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        
        {/* Health Tips Banner */}
        <div className="health-tips-banner" onClick={() => navigate('/educacao')}>
          <Activity size={24} style={{ color: 'var(--success)' }} />
          <div>
            <div style={{ fontWeight: 600 }}>Dicas de Saúde Funcionais</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Veja orientações para o dia a dia</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="action-row" ref={actionRowRef}>
          <button 
            className={`action-pill ${view === 'lista' ? 'active' : ''}`}
            onClick={() => handleViewChange('lista')}
          >
            <FileText size={20} /> Meus Pedidos
          </button>
          
          <button 
            className={`action-pill ${view === 'nova' ? 'active' : ''}`}
            onClick={() => handleViewChange('nova')}
          >
            <PlusCircle size={20} /> Pedir Atendimento
          </button>
        </div>

        {/* View Content */}
        <div className="view-enter" key={view} style={{ marginTop: '1.5rem' }}>
          {view === 'lista' ? (
             <ListaChamados onNovaSolicitacao={() => handleViewChange('nova')} />
          ) : (
             <NovaSolicitacao 
               onCancel={() => handleViewChange('lista')} 
               onSucesso={handleSolicitacaoSucesso} 
             />
          )}
        </div>

      </main>

      {/* FAB - Mobile only (shown via CSS) */}
      {view === 'lista' && (
        <button 
          className="fab" 
          onClick={() => handleViewChange('nova')}
          aria-label="Pedir Atendimento"
        >
          <PlusCircle size={24} />
        </button>
      )}
    </div>
  );
}
