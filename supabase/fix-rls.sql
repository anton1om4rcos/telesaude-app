-- Execute isto no SQL Editor do Supabase para corrigir o erro de RLS no cadastro

-- 1. Permite que o usuário insira seu profile através do RLS. 
-- A política antiga "Usuários inserem seu próprio perfil" pode falhar no ato do signUp via API anônima.
-- Uma abordagem comum e mais segura é usar um Trigger:

-- Criação da função de trigger para inserir o profile automaticamente
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, type, name, phone)
  values (
    new.id,
    -- Pega do metadata enviado no signUp (se não vier, default 'paciente')
    coalesce(new.raw_user_meta_data->>'type', 'paciente'),
    coalesce(new.raw_user_meta_data->>'name', 'Usuário'),
    coalesce(new.raw_user_meta_data->>'phone', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Criação do Trigger associado à auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
