import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { HeartPulse, LogIn, AlertCircle, ShieldCheck, Stethoscope, BookOpen } from 'lucide-react';
import { translateAuthError } from '../lib/errorMapping';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      await new Promise(resolve => setTimeout(resolve, 500));

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('type')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        navigate('/paciente');
        return;
      }

      if (profile.type === 'paciente') {
        navigate('/paciente');
      } else if (profile.type === 'profissional') {
        navigate('/profissional');
      } else {
        navigate('/paciente');
      }
    } catch (err) {
      setError(translateAuthError(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container auth-split">
      {/* Branding side (visible only on desktop ≥ 960px via CSS) */}
      <div className="auth-branding">
        <div className="auth-branding-content">
          <div className="auth-branding-icon">
            <HeartPulse size={40} />
          </div>
          <h2>TeleSaúde Comunidades</h2>
          <p>Saúde acessível para comunidades remotas. Conectando pacientes e profissionais de saúde em qualquer lugar.</p>
          <ul className="auth-branding-features">
            <li><ShieldCheck size={20} /> Triagem remota segura e rápida</li>
            <li><Stethoscope size={20} /> Orientação médica qualificada</li>
            <li><BookOpen size={20} /> Educação em saúde preventiva</li>
          </ul>
        </div>
      </div>

      {/* Form side */}
      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <HeartPulse size={32} />
            </div>
            <h1 className="auth-title">Bem-vindo(a) de volta</h1>
            <p className="auth-subtitle">Acesso ao TeleSaúde Comunidades</p>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">E-mail</label>
              <input 
                id="email"
                type="email" 
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Senha</label>
              <input 
                id="password"
                type="password" 
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Entrando...' : (
                <>
                  <LogIn size={20} /> Entrar na Plataforma
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            Não tem uma conta? <Link to="/register" className="auth-link">Cadastre-se</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
