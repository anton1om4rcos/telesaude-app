import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, PlusCircle, Trash2, Search, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';

export default function Educacao() {
  const [profile, setProfile] = useState(null);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form states (Create/Edit - Professional only)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Track expanded cards
  const [expandedCards, setExpandedCards] = useState(new Set());

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

    setProfile(data);
    fetchContents();
  }

  async function fetchContents() {
    setLoading(true);
    const { data, error } = await supabase
      .from('education_content')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setContents(data);
    }
    setLoading(false);
  }

  function openCreateForm() {
    setNewTitle('');
    setNewDesc('');
    setEditingId(null);
    setIsFormOpen(true);
  }

  function openEditForm(item) {
    setNewTitle(item.title);
    setNewDesc(item.description);
    setEditingId(item.id);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingId(null);
    setNewTitle('');
    setNewDesc('');
  }

  async function handleSubmitForm(e) {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    if (editingId) {
      const { error } = await supabase
        .from('education_content')
        .update({ title: newTitle, description: newDesc })
        .eq('id', editingId);
        
      if (!error) {
        closeForm();
        fetchContents();
      } else {
        alert("Erro ao atualizar a cartilha. Verifique suas permissões.");
      }
    } else {
      const { error } = await supabase.from('education_content').insert({
        title: newTitle,
        description: newDesc
      });

      if (!error) {
        closeForm();
        fetchContents();
      } else {
        alert("Erro ao criar conteúdo. Tem certeza que você é um profissional no banco de dados?");
      }
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Excluir esta cartilha?')) return;
    
    const { error } = await supabase.from('education_content').delete().eq('id', id);
    if (!error) {
      fetchContents();
    }
  }

  const handleBack = () => {
    if (profile?.type === 'profissional') navigate('/profissional');
    else navigate('/paciente');
  };

  const toggleExpanded = (id) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isProfissional = profile?.type === 'profissional';

  const filteredContents = contents.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={isProfissional ? 'admin-layout' : 'layout-container'}>
        <header className={isProfissional ? 'app-header admin-header' : 'app-header'}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={handleBack} className="btn-icon">
              <ArrowLeft size={24} />
            </button>
            <div>
              <div className="skeleton skeleton-line" style={{ width: '160px', height: '1.2rem' }} />
              <div className="skeleton skeleton-line short" style={{ marginTop: '0.5rem', height: '0.9rem' }} />
            </div>
          </div>
        </header>
        <main className={isProfissional ? 'admin-main' : 'main-content'}>
          <div className="skeleton-card skeleton" style={{ height: '48px', marginBottom: '1.5rem' }} />
          <div className="education-grid">
            {[1,2,3,4].map(i => (
              <div key={i} className="skeleton-card">
                <div className="skeleton skeleton-line medium" />
                <div className="skeleton skeleton-line long" />
                <div className="skeleton skeleton-line long" />
                <div className="skeleton skeleton-line short" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={isProfissional ? 'admin-layout' : 'layout-container'}>
      <header className={isProfissional ? 'app-header admin-header' : 'app-header'}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={handleBack} className="btn-icon">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="header-title">Dicas de Saúde</h1>
            <p className="header-subtitle">Orientações validadas por profissionais</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isProfissional && !isFormOpen && (
            <button className="btn-primary btn-sm" onClick={openCreateForm}>
              <PlusCircle size={18} /> Nova Cartilha
            </button>
          )}
          <ThemeToggle />
        </div>
      </header>

      <main className={isProfissional ? 'admin-main' : 'main-content'}>
        
        {/* Create/Edit Form */}
        {isProfissional && isFormOpen && (
          <div className="card fade-in" style={{ marginBottom: '2rem' }}>
            <h3 className="section-title">{editingId ? 'Editar Cartilha' : 'Escrever Nova Cartilha'}</h3>
            <form onSubmit={handleSubmitForm} className="form-stack">
              <div className="form-group">
                <label className="form-label">Título</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ex: Como evitar o mosquito da Dengue"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Conteúdo / Orientações</label>
                <textarea 
                  className="form-input" 
                  rows="4"
                  placeholder="Escreva a orientação de saúde de forma clara..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  required
                />
              </div>
              <div className="button-group">
                <button type="button" className="btn-secondary" onClick={closeForm}>Cancelar</button>
                <button type="submit" className="btn-primary">{editingId ? 'Salvar Alterações' : 'Publicar Dica'}</button>
              </div>
            </form>
          </div>
        )}

        {/* Search Bar */}
        <div className="search-box" style={{ marginBottom: '1.5rem', backgroundColor: 'var(--surface)' }}>
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Pesquisar dicas por título ou conteúdo..." 
            className="form-input search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Education Cards Grid */}
        {filteredContents.length === 0 && !isFormOpen ? (
          <div className="empty-state fade-in">
            <BookOpen size={48} className="empty-icon" />
            <h3>Nenhuma cartilha encontrada</h3>
            <p>O que você buscou não foi encontrado ou não há materiais publicados.</p>
          </div>
        ) : (
          <div className={`education-grid ${isProfissional ? 'admin-view' : ''}`}>
            {filteredContents.map(item => {
              const isExpanded = expandedCards.has(item.id);
              const isLong = item.description && item.description.length > 180;
              
              return (
                <article key={item.id} className="education-card">
                  <h3 className="education-card-title">
                    {item.title}
                  </h3>
                  <p className={`education-card-desc ${isLong && !isExpanded ? 'truncated' : 'expanded'}`}>
                    {item.description}
                  </p>
                  {isLong && (
                    <button className="read-more-btn" onClick={() => toggleExpanded(item.id)}>
                      {isExpanded ? (
                        <><ChevronUp size={14} /> Mostrar menos</>
                      ) : (
                        <><ChevronDown size={14} /> Ler mais...</>
                      )}
                    </button>
                  )}
                  <div className="education-card-date">
                    Publicado em {new Date(item.created_at).toLocaleDateString('pt-BR')}
                  </div>

                  {/* Professional edit/delete actions */}
                  {isProfissional && (
                     <div className="education-card-actions">
                       <button 
                         className="btn-icon" 
                         onClick={() => openEditForm(item)}
                         title="Editar Cartilha"
                         style={{ color: 'var(--primary)' }}
                       >
                         <Edit2 size={18} />
                       </button>
                       <button 
                         className="btn-icon text-error" 
                         onClick={() => handleDelete(item.id)}
                         title="Excluir Cartilha"
                       >
                         <Trash2 size={18} />
                       </button>
                     </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}
