import { useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { HeartPulse, UserPlus, AlertCircle, User, Stethoscope, ShieldCheck, BookOpen } from 'lucide-react';
import { translateAuthError } from '../lib/errorMapping';

function getPasswordStrength(password) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { level: 'weak', label: 'Fraca', class: 'strength-weak', color: 'var(--error)' };
  if (score <= 3) return { level: 'medium', label: 'Média', class: 'strength-medium', color: 'var(--warning)' };
  return { level: 'strong', label: 'Forte', class: 'strength-strong', color: 'var(--success)' };
}

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState('paciente');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            type
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        if (type === 'paciente') {
          navigate('/paciente');
        } else {
          navigate('/profissional');
        }
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
          <h2>Junte-se ao TeleSaúde</h2>
          <p>Faça parte da plataforma que conecta comunidades remotas a profissionais de saúde qualificados.</p>
          <ul className="auth-branding-features">
            <li><ShieldCheck size={20} /> Plataforma segura e gratuita</li>
            <li><Stethoscope size={20} /> Atendimento remoto simplificado</li>
            <li><BookOpen size={20} /> Conteúdo educativo de saúde</li>
          </ul>
        </div>
      </div>

      {/* Form side */}
      <div className="auth-form-side">
        <div className="auth-card" style={{ maxWidth: '480px' }}>
          <div className="auth-header">
            <div className="auth-logo">
              <HeartPulse size={32} />
            </div>
            <h1 className="auth-title">Criar Conta</h1>
            <p className="auth-subtitle">Cadastro no TeleSaúde Comunidades</p>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister}>
            
            <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Eu sou um(a):</label>
            <div className="type-selector">
              <label className="type-option">
                <input 
                  type="radio" 
                  name="user_type" 
                  value="paciente"
                  checked={type === 'paciente'}
                  onChange={() => setType('paciente')}
                />
                <div className="type-card">
                  <User size={20} className="type-icon" />
                  <div style={{ fontWeight: 600 }}>Paciente</div>
                </div>
              </label>

              <label className="type-option">
                <input 
                  type="radio" 
                  name="user_type" 
                  value="profissional"
                  checked={type === 'profissional'}
                  onChange={() => setType('profissional')}
                />
                <div className="type-card">
                  <Stethoscope size={20} className="type-icon" />
                  <div style={{ fontWeight: 600 }}>Profissional</div>
                </div>
              </label>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="name">Nome Completo</label>
              <input 
                id="name"
                type="text" 
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="João da Silva"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">Celular</label>
              <input 
                id="phone"
                type="text" 
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                required
              />
            </div>

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
                placeholder="Mínimo de 6 caracteres"
                required
                minLength="6"
              />
              {strength && (
                <>
                  <div className="password-strength">
                    <div className={`password-strength-bar ${strength.class}`} />
                  </div>
                  <div className="password-strength-text" style={{ color: strength.color }}>
                    {strength.label}
                  </div>
                </>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Criando conta...' : (
                <>
                  <UserPlus size={20} /> Cadastrar
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            Já tem uma conta? <Link to="/" className="auth-link">Fazer Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
