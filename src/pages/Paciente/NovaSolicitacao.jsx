import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Send, UploadCloud, AlertCircle, X, CheckCircle } from 'lucide-react';

export default function NovaSolicitacao({ onCancel, onSucesso }) {
  const [reason, setReason] = useState('Outro');
  const [duration, setDuration] = useState('Hoje');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('Normal');
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      let photo_url = null;

      if (file) {
        if (file.size > 5 * 1024 * 1024) throw new Error("A imagem não pode ter mais que 5MB.");

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(fileName, file);

        if (uploadError) throw new Error("Erro ao fazer upload da imagem: Bucket 'attachments' existe e é público?");

        const { data: publicData } = supabase.storage
          .from('attachments')
          .getPublicUrl(fileName);

        photo_url = publicData.publicUrl;
      }

      const { error: insertError } = await supabase
        .from('requests')
        .insert({
          patient_id: user.id,
          reason,
          duration,
          description,
          urgency,
          photo_url
        });

      if (insertError) throw insertError;

      // Show success animation briefly
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSucesso();
      }, 1800);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="success-overlay">
        <div className="success-card">
          <div className="success-icon">
            <CheckCircle size={32} />
          </div>
          <h3 className="success-title">Pedido Enviado!</h3>
          <p className="success-message">Um profissional de saúde irá analisar<br />seu caso em breve.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card fade-in">
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>O que está sentindo?</h2>

      {error && (
        <div className="error-message">
          <AlertCircle size={18} /><span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-stack">

        {/* 2-column grid on desktop */}
        <div className="form-grid-2col">
          <div className="form-group">
            <label className="form-label">Motivo Principal</label>
            <select
              className="form-input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option>Dores no corpo</option>
              <option>Febre ou Gripe</option>
              <option>Lesão na pele / Ferida</option>
              <option>Dificuldade para respirar</option>
              <option>Enjoo / Dor de barriga</option>
              <option>Outro</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Nível de Dor / Urgência</label>
            <select
              className="form-input"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
            >
              <option value="Baixa">Consigo esperar (Baixa)</option>
              <option value="Normal">Incomoda, mas suportável (Normal)</option>
              <option value="Alta">Muita dor (Alta)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Há quanto tempo?</label>
          <div className="pill-selector">
            {['Hoje', 'Há 2-3 dias', 'Há uma semana', 'Mais tempo'].map(opt => (
              <div
                key={opt}
                className={`pill-option ${duration === opt ? 'selected' : ''}`}
                onClick={() => setDuration(opt)}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Explique melhor o que você sente (Opcional)</label>
          <textarea
            className="form-input"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Começou com uma dor fraca na perna..."
          />
        </div>

        <div className="form-group file-upload-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UploadCloud size={20} /> Anexar Foto (Máx 5MB)
          </label>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={(e) => setFile(e.target.files[0])}
            className="file-input"
          />
          {file && (
            <div className="file-name" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span>{file.name}</span>
              <button
                type="button"
                className="btn-icon"
                onClick={clearFile}
                title="Remover anexo"
                style={{ color: 'var(--error)' }}
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="button-group mt-2">
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Enviando...' : <><Send size={20} /> Enviar Pedido</>}
          </button>
        </div>

      </form>
    </div>
  );
}
