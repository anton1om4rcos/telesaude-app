import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Send, AlertCircle, FileText } from 'lucide-react';

export default function RespostaModal({ solicitacao, profissionalId, onClose }) {
  const [content, setContent] = useState('');
  const [needsVisit, setNeedsVisit] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchingResponse, setFetchingResponse] = useState(false);

  const isConcluido = solicitacao.status === 'concluido';

  useEffect(() => {
    if (isConcluido) {
      fetchExistingResponse();
    }
  }, [solicitacao.id, isConcluido]);

  const fetchExistingResponse = async () => {
    setFetchingResponse(true);
    const { data } = await supabase
      .from('responses')
      .select('*')
      .eq('request_id', solicitacao.id)
      .maybeSingle();
      
    if (data) {
      setContent(data.content || '');
      setNeedsVisit(data.needs_visit || false);
    }
    setFetchingResponse(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
       setError("Por favor, escreva uma instrução para o paciente.");
       return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Inserir a resposta (RF07)
      const { error: responseError } = await supabase
        .from('responses')
        .insert({
          request_id: solicitacao.id,
          doctor_id: profissionalId,
          content,
          needs_visit: needsVisit
        });

      if (responseError) throw responseError;

      // 2. Atualizar status do chamado para concluído (RF08)
      const { error: updateError } = await supabase
        .from('requests')
        .update({ status: 'concluido' })
        .eq('id', solicitacao.id);

      if (updateError) throw updateError;

      onClose(true); // Sucesso, manda recarregar a fila
    } catch (err) {
      setError(err.message || 'Erro ao enviar resposta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content card fade-in" style={{ width: '100%', maxWidth: '700px' }}>
        <div className="modal-header">
          <h2>Atendimento: {solicitacao.patient?.name}</h2>
          <button className="btn-icon" onClick={() => onClose(false)}><X size={24} /></button>
        </div>

        <div className="modal-body">
          {/* Dados do Paciente */}
          <div className="patient-report">
            <h3 className="section-title">Relato do Paciente</h3>
            <div className="report-grid">
              <div><strong>Motivo:</strong> {solicitacao.reason}</div>
              <div><strong>Duração:</strong> {solicitacao.duration}</div>
              <div><strong>Urgência:</strong> {solicitacao.urgency}</div>
              <div style={{ gridColumn: '1 / -1' }}>
                <strong>Descrição:</strong> {solicitacao.description || 'Não fornecida.'}
              </div>
            </div>
            
            {solicitacao.photo_url && (
              <div className="photo-preview mt-2">
                <strong>Anexo:</strong><br/>
                <a href={solicitacao.photo_url} target="_blank" rel="noreferrer">
                  <img src={solicitacao.photo_url} alt="Lesão enviada" className="img-thumbnail" />
                </a>
              </div>
            )}
          </div>

          <hr className="divider" />

          {/* Área de Resposta do Profissional */}
          <h3 className="section-title">{isConcluido ? 'Parecer Médico' : 'Responder ao Paciente'}</h3>
          
          {fetchingResponse ? (
            <p>Carregando resposta...</p>
          ) : isConcluido ? (
            <div className="card fade-in" style={{ backgroundColor: 'var(--surface)', marginTop: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <FileText size={20} color="var(--primary)" />
                <h4 style={{ margin: 0, color: 'var(--primary)' }}>Orientações e Conduta Médica</h4>
              </div>
              <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-main)', marginBottom: '1rem' }}>
                {content || 'Nenhuma instrução em texto fornecida.'}
              </p>
              
              {needsVisit && (
                <div style={{ padding: '0.875rem', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '4px', border: '1px solid #ffeeba', fontWeight: 500 }}>
                  <AlertCircle size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle', marginTop: '-2px' }}/>
                  Encaminhamento presencial solicitado ao paciente.
                </div>
              )}
              
              <div className="modal-footer mt-4">
                <button type="button" className="btn-secondary" onClick={() => onClose(false)}>
                  Fechar
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div className="error-message"><AlertCircle size={18}/> {error}</div>}

              <div className="form-group mt-2">
                <label className="form-label">Orientações e Conduta Médica</label>
                <textarea 
                  className="form-input" 
                  rows="5"
                  placeholder="Ex: Lave o local com soro, aplique compressa fria. Evite sol."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  checked={needsVisit}
                  onChange={(e) => setNeedsVisit(e.target.checked)}
                />
                <span className="checkbox-label" style={{ color: 'var(--error)', fontWeight: 600 }}>
                  EXIGE ENCAMINHAMENTO FÍSICO (Indicar ao paciente que procure o posto de saúde).
                </span>
              </label>

              <div className="modal-footer mt-4">
                <button type="button" className="btn-secondary" onClick={() => onClose(false)} disabled={loading}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={loading || solicitacao.status === 'concluido'}>
                  {loading ? 'Enviando...' : <><Send size={18}/> Finalizar e Enviar</>}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
