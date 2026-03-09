import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LogOut, Search, Clock, ShieldAlert, CheckCircle, Users, Camera } from 'lucide-react';
import RespostaModal from './RespostaModal';
import ThemeToggle from '../../components/ThemeToggle';

export default function DashboardProfissional() {
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  
  // Modal control
  const [requestAtual, setRequestAtual] = useState(null);

  const navigate = useNavigate();

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

    if (data && data.type !== 'profissional') {
      navigate(`/${data.type}`);
    } else {
      setProfile(data || { name: 'Profissional' });
      fetchFila();
    }
  }

  async function fetchFila() {
    setLoading(true);
    const { data, error } = await supabase
      .from('requests')
      .select(`
        *,
        patient:profiles ( name )
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRequests(data);
    }
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/');
  }

  // Counts
  const aguardandoCount = requests.filter(r => r.status === 'aguardando').length;
  const emProgressoCount = requests.filter(r => r.status === 'em_progresso').length;
  const concluidoCount = requests.filter(r => r.status === 'concluido').length;

  // Filtering
  const filteredRequests = requests
    .filter(req => {
      if (statusFilter === 'aguardando') return req.status === 'aguardando';
      if (statusFilter === 'em_progresso') return req.status === 'em_progresso';
      if (statusFilter === 'concluido') return req.status === 'concluido';
      return true;
    })
    .filter(req => 
      req.reason.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (req.patient?.name && req.patient.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const abrirAtendimento = async (req) => {
    if (req.status === 'aguardando') {
      await supabase.from('requests').update({ status: 'em_progresso' }).eq('id', req.id);
      req.status = 'em_progresso';
    }
    setRequestAtual(req);
  };

  const fecharAtendimento = (recarregarFila = false) => {
    setRequestAtual(null);
    if (recarregarFila) fetchFila();
  };

  const getStatusBadge = (status) => {
    if (status === 'aguardando') return <span className="badge badge-warning"><Clock size={14}/> Aguardando</span>;
    if (status === 'em_progresso') return <span className="badge badge-primary"><Clock size={14}/> Em Leitura</span>;
    if (status === 'concluido') return <span className="badge badge-success"><CheckCircle size={14}/> Concluído</span>;
  };

  if (!profile) {
    return (
      <div className="admin-layout">
        <header className="app-header admin-header">
          <div>
            <div className="skeleton skeleton-line" style={{ width: '200px', height: '1.2rem' }} />
            <div className="skeleton skeleton-line short" style={{ marginTop: '0.5rem', height: '0.9rem' }} />
          </div>
        </header>
        <main className="admin-main">
          <div className="dashboard-stats">
            <div className="skeleton-card skeleton" style={{ height: '90px' }} />
            <div className="skeleton-card skeleton" style={{ height: '90px' }} />
            <div className="skeleton-card skeleton" style={{ height: '90px' }} />
          </div>
          <div className="skeleton-card skeleton" style={{ height: '300px', marginTop: '1.5rem' }} />
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Header */}
      <header className="app-header admin-header">
        <div>
          <h1 className="header-title">Painel do Profissional</h1>
          <p className="header-subtitle">Bem-vindo(a), {profile.name}</p>
        </div>
        <div className="admin-header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="btn-secondary btn-sm" onClick={() => navigate('/educacao')}>
            Gerir Dicas de Saúde
          </button>
          <ThemeToggle />
          <button onClick={handleLogout} className="btn-icon text-error">
            <LogOut size={24} />
          </button>
        </div>
      </header>

      <main className="admin-main">
        {/* Stats with icons */}
        <div className="dashboard-stats">
           <div className="stat-card">
             <div className="stat-icon stat-icon-warning">
               <Clock size={24} />
             </div>
             <div className="stat-info">
               <div className="stat-value">{aguardandoCount}</div>
               <div className="stat-label">Na Fila</div>
             </div>
           </div>
           <div className="stat-card">
             <div className="stat-icon stat-icon-primary">
               <Users size={24} />
             </div>
             <div className="stat-info">
               <div className="stat-value">{emProgressoCount}</div>
               <div className="stat-label">Em Leitura</div>
             </div>
           </div>
           <div className="stat-card">
             <div className="stat-icon stat-icon-success">
               <CheckCircle size={24} />
             </div>
             <div className="stat-info">
               <div className="stat-value">{concluidoCount}</div>
               <div className="stat-label">Atendidos</div>
             </div>
           </div>
        </div>

        <div className="card mt-4">
          <div className="card-header-flex">
            <h2>Fila de Triagem</h2>
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Buscar por nome ou sintoma..." 
                className="form-input search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filter pills */}
          <div className="filter-pills mt-2">
            <button 
              className={`filter-pill ${statusFilter === 'todos' ? 'active' : ''}`}
              onClick={() => setStatusFilter('todos')}
            >
              Todos <span className="filter-count">{requests.length}</span>
            </button>
            <button 
              className={`filter-pill ${statusFilter === 'aguardando' ? 'active' : ''}`}
              onClick={() => setStatusFilter('aguardando')}
            >
              Aguardando <span className="filter-count">{aguardandoCount}</span>
            </button>
            <button 
              className={`filter-pill ${statusFilter === 'em_progresso' ? 'active' : ''}`}
              onClick={() => setStatusFilter('em_progresso')}
            >
              Em Leitura <span className="filter-count">{emProgressoCount}</span>
            </button>
            <button 
              className={`filter-pill ${statusFilter === 'concluido' ? 'active' : ''}`}
              onClick={() => setStatusFilter('concluido')}
            >
              Concluídos <span className="filter-count">{concluidoCount}</span>
            </button>
          </div>

          <div className="mt-4">
            {loading ? (
              <div>
                {[1,2,3].map(i => (
                  <div key={i} className="skeleton-card" style={{ marginBottom: '1rem' }}>
                    <div className="skeleton skeleton-line medium" />
                    <div className="skeleton skeleton-line long" />
                    <div className="skeleton skeleton-line short" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="admin-desktop-view table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Urgência / Tempo</th>
                        <th>Paciente</th>
                        <th>Motivo Principal</th>
                        <th>Anexo</th>
                        <th>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map(req => (
                        <tr key={req.id} className={req.status === 'concluido' ? 'row-opacity' : ''}>
                          <td>{getStatusBadge(req.status)}</td>
                          <td>
                             <div>{req.urgency === 'Alta' && <ShieldAlert size={14} color="var(--error)"/>} {req.urgency}</div>
                             <small className="text-muted">{req.duration}</small>
                          </td>
                          <td style={{ fontWeight: 500 }}>{req.patient?.name || 'Desconhecido'}</td>
                          <td>{req.reason}</td>
                          <td>{req.photo_url ? <><Camera size={14}/> Sim</> : '-'}</td>
                          <td>
                            <button 
                              className={`btn-sm ${req.status === 'concluido' ? 'btn-secondary' : 'btn-primary'}`}
                              onClick={() => abrirAtendimento(req)}
                              style={req.status === 'concluido' ? {opacity: 1} : {}}
                            >
                              {req.status === 'concluido' ? 'Visualizar' : 'Atender'}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredRequests.length === 0 && (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                            Nenhuma solicitação encontrada.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="admin-mobile-view">
                  {filteredRequests.length === 0 ? (
                    <div className="empty-state">
                      <p className="text-muted">Nenhuma solicitação encontrada.</p>
                    </div>
                  ) : (
                    <div className="mobile-request-cards">
                      {filteredRequests.map(req => (
                        <div 
                          key={req.id} 
                          className={`mobile-request-card ${req.status === 'concluido' ? 'row-opacity' : ''}`}
                        >
                          <div className="mobile-card-header">
                            <span className="mobile-card-patient">{req.patient?.name || 'Desconhecido'}</span>
                            {getStatusBadge(req.status)}
                          </div>
                          <div className="mobile-card-body">
                            <div className="mobile-card-row">
                              <strong>Motivo:</strong> {req.reason}
                            </div>
                            <div className="mobile-card-row">
                              <strong>Urgência:</strong> 
                              {req.urgency === 'Alta' && <ShieldAlert size={14} color="var(--error)"/>} 
                              {req.urgency} · {req.duration}
                            </div>
                            {req.photo_url && (
                              <div className="mobile-card-row">
                                <Camera size={14}/> <span>Foto anexada</span>
                              </div>
                            )}
                          </div>
                          <div className="mobile-card-footer">
                            <button 
                              className={`btn-sm ${req.status === 'concluido' ? 'btn-secondary' : 'btn-primary'}`}
                              onClick={() => abrirAtendimento(req)}
                            >
                              {req.status === 'concluido' ? 'Visualizar' : 'Atender'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {requestAtual && (
        <RespostaModal 
          solicitacao={requestAtual} 
          profissionalId={profile.id}
          onClose={(salvou) => fecharAtendimento(salvou)} 
        />
      )}
    </div>
  );
}
