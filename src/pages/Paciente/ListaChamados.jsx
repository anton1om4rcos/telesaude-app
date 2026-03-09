import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Clock, CheckCircle, Inbox } from 'lucide-react';

export default function ListaChamados({ onNovaSolicitacao }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('requests')
      .select(`
        *,
        responses (
          content,
          needs_visit,
          created_at
        )
      `)
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRequests(data);
    }
    setLoading(false);
  }

  const getStatusBadge = (status) => {
    if (status === 'aguardando') return <span className="badge badge-warning"><Clock size={14}/> Aguardando</span>;
    if (status === 'em_progresso') return <span className="badge badge-primary"><Clock size={14}/> Em Leitura</span>;
    if (status === 'concluido') return <span className="badge badge-success"><CheckCircle size={14}/> Respondido</span>;
  };

  if (loading) {
    return (
      <div className="requests-list requests-grid fade-in">
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div className="skeleton skeleton-line medium" style={{ marginBottom: 0 }} />
              <div className="skeleton skeleton-line short" style={{ marginBottom: 0, width: '80px' }} />
            </div>
            <div className="skeleton skeleton-line long" />
            <div className="skeleton skeleton-line medium" />
          </div>
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="card empty-state fade-in">
        <div className="empty-icon"><Inbox size={48} /></div>
        <h3>Você não tem pedidos de atendimento</h3>
        <p>Se estiver sentindo algo, crie uma solicitação para um profissional de saúde analisar.</p>
        <button className="btn-primary" onClick={onNovaSolicitacao} style={{ marginTop: '1.5rem', width: 'fit-content', padding: '0.75rem 2rem' }}>
          Pedir Atendimento
        </button>
      </div>
    );
  }

  return (
    <div className="requests-list requests-grid fade-in">
      {requests.map(req => (
        <div key={req.id} className="request-card">
          <div className="request-header">
            <div>
              <div className="request-title">{req.reason}</div>
              <div className="request-date">{new Date(req.created_at).toLocaleDateString('pt-BR')}</div>
            </div>
            {getStatusBadge(req.status)}
          </div>
          
          <div className="request-body">
            <p className="request-desc">{req.description || "Nenhuma descrição detalhada."}</p>
          </div>

          {/* Medical Response - RF05 */}
          {req.responses && req.responses.length > 0 && (
            <div className="medical-response">
              <div className="response-title">👩‍⚕️ Resposta da Equipe de Saúde:</div>
              <p className="response-content">{req.responses[0].content}</p>
              
              {req.responses[0].needs_visit && (
                <div className="alert alert-warning mt-2">
                  <strong>Atenção:</strong> O profissional recomendou que você vá fisicamente ao Posto de Saúde.
                </div>
              )}
            </div>
          )}

        </div>
      ))}
    </div>
  );
}
