# TeleSaúde Comunidades - MVP Acadêmico 🏥

Projeto de desenvolvimento full-stack criado para a **UNINTER**, visando apresentar uma solução de telemedicina focada em comunidades remotas e áreas rurais. O objetivo do MVP é conectar pacientes com dificuldade de locomoção ou acesso a postos de saúde a médicos e profissionais, permitindo um pronto atendimento digital (triagem), além de fornecer materiais de educação em saúde.

## 🚀 Tecnologias Utilizadas

- **Frontend:** React, Vite, React Router DOM, Vanilla CSS (Mobile-First / Desktop-First)
- **Backend/BaaS:** Supabase (Autenticação, Banco de Dados Relacional PostgreSQL, Storage e Row Level Security)
- **Ícones:** Lucide React

## ⚙️ Principais Funcionalidades

1. **Autenticação Dupla:** Permissão de cadastro tanto para **Pacientes** quanto para **Profissionais da Saúde**;
2. **Dashboard do Paciente:**
   - Criação de solicitações médicas (triagem sintomática).
   - Possibilidade de anexar fotos para avaliação.
   - Acompanhamento do status de atendimento ("Aguardando" -> "Concluído").
3. **Dashboard do Profissional:**
   - Fila de triagem organizada.
   - Modal de avaliação para responder os pacientes e definir a conduta médica, ou indicar o encaminhamento presencial.
4. **Educação em Saúde:**
   - Tela com apostilas / cartilhas de Primeiros Socorros focada em áreas remotas.
   - Painel para o profissional criar, editar ou excluir orientações usando CRUD.
   - Barra de pesquisa integrada (títulos e conteúdos).

---

## 💻 Como rodar o projeto localmente

### Pré-requisitos
- Ter o **Node.js** instalado na sua máquina.
- Ter uma conta e projeto ativo criado no **Supabase** (para o backend).

### Passo 1: Configuração do Backend (Supabase)
Dentro do painel do seu projeto no Supabase, abra o menu **SQL Editor**. Você precisará rodar os scripts localizados na pasta `/supabase` do nosso projeto para criar a infraestrutura do banco:

1. Execute o conteúdo de `supabase/schema.sql` (Cria as tabelas `profiles`, `requests`, `responses` etc).
2. Execute o conteúdo de `supabase/fix-rls.sql` e `supabase/fix-rls-profissionais.sql` (Ajusta políticas de segurança - Row Level Security).
3. Execute o conteúdo de `supabase/seed-dicas.sql` (Popula o banco com artigos de primeiros socorros nativos).
4. No menu lateral do Supabase, acesse **Storage**, crie um Bucket público chamado `attachments` (usado para as fotos de triagem).

### Passo 2: Clonando e configurando o Frontend

1. Baixe os arquivos do projeto para sua máquina.
2. Pelo terminal, navegue até a pasta do projeto:
   ```bash
   cd uninter-project
   ```

3. Instale as dependências:
   ```bash
   npm install
   ```

4. Renomeie o arquivo `.env.example` para `.env` e preencha com as chaves de API do seu Supabase (elas ficam acessíveis no menu de *Project Settings* > *API* do Supabase):
   ```env
   VITE_SUPABASE_URL=https://seuidprojeto.supabase.co
   VITE_PUBLISHABLE_KEY=sua_chave_anon_gigante
   ```

5. Inicialize o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

6. Abra no seu navegador o endereço fornecido no terminal (geralmente `http://localhost:5173`).

---

## 👨💻 Escopo do MVP

Este sistema é um *Minimum Viable Product* desenhado em um escopo educacional e atende aos requisitos de autenticação assíncrona, renderização condicional por cargos, uploads de arquivos, manipulação complexa de banco de dados e UX responsivo.
