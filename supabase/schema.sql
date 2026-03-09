-- schema.sql
-- Execute este script no SQL Editor do seu projeto Supabase

-- 1. Criação das tabelas
create table public.profiles (
  id uuid references auth.users not null primary key,
  type varchar(20) not null check (type in ('paciente', 'profissional')),
  name varchar(255) not null,
  phone varchar(50)
);

create table public.requests (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.profiles(id) not null,
  reason varchar(100) not null,
  duration varchar(100) not null,
  description text not null,
  urgency varchar(50) not null,
  status varchar(20) not null default 'aguardando' check (status in ('aguardando', 'em_progresso', 'concluido')),
  photo_url varchar(1000),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.responses (
  id uuid default gen_random_uuid() primary key,
  request_id uuid references public.requests(id) not null,
  doctor_id uuid references public.profiles(id) not null,
  content text not null,
  needs_visit boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.education_content (
  id uuid default gen_random_uuid() primary key,
  title varchar(255) not null,
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Habilitando RLS (Row Level Security)
alter table public.profiles enable row level security;
alter table public.requests enable row level security;
alter table public.responses enable row level security;
alter table public.education_content enable row level security;

-- 3. Políticas da tabela profiles
create policy "Perfis públicos são visíveis a todos." on profiles for select using (true);
create policy "Usuários inserem seu próprio perfil." on profiles for insert with check (auth.uid() = id);
create policy "Usuários atualizam o próprio perfil." on profiles for update using (auth.uid() = id);

-- 4. Políticas da tabela requests
create policy "Pacientes inserem seus próprios chamados" on requests for insert with check (auth.uid() = patient_id);
create policy "Pacientes leem seus chamados, profissionais leem todos" on requests for select using (
  auth.uid() = patient_id OR 
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.type = 'profissional')
);
create policy "Profissionais podem atualizar chamados" on requests for update using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.type = 'profissional')
);

-- 5. Políticas da tabela responses
create policy "Profissionais podem inserir respostas" on responses for insert with check (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.type = 'profissional')
);
create policy "Envolvidos no chamado leem as respostas" on responses for select using (
  auth.uid() = doctor_id OR
  exists (select 1 from requests where requests.id = request_id and requests.patient_id = auth.uid()) OR
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.type = 'profissional')
);

-- 6. Políticas da tabela education_content
create policy "Todos leem conteúdo" on education_content for select using (true);
create policy "Profissionais inserem conteúdo" on education_content for insert with check (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.type = 'profissional')
);
create policy "Profissionais atualizam conteúdo" on education_content for update using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.type = 'profissional')
);
create policy "Profissionais deletam conteúdo" on education_content for delete using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.type = 'profissional')
);

-- 7. Storage Bucket (para fotos de lesões / anexos)
-- Crie um bucket chamado 'attachments' no painel Storage do Supabase (torne-o público se necessário ou ajuste as políticas)
