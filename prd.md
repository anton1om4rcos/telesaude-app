<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Gere o prd, nao quero codigo. somente os requisitos

Aqui está o Documento de Requisitos do Produto (PRD) focado **exclusivamente nas regras de negócio e requisitos**, sem nenhum código, ideal para guiar o seu desenvolvimento e para documentar na sua Atividade Extensionista III.

***

# Documento de Requisitos do Produto (PRD) – MVP TeleSaúde Comunidades

## 1. Visão Geral do Projeto

**Produto:** Protótipo funcional de um sistema web de telemedicina focado em comunidades remotas e áreas de vulnerabilidade social.
**Propósito:** Reduzir barreiras de acesso à saúde oferecendo uma via de triagem remota, orientações primárias e educação em saúde.
**Arquitetura Definida:** Aplicação Frontend (Single Page Application) integrada diretamente a um Backend as a Service (Supabase) para Autenticação, Banco de Dados Relacional e Armazenamento de Arquivos.

## 2. Perfis de Usuário (Atores)

O sistema deve suportar dois tipos distintos de usuários, cada um com fluxos e permissões específicas:

1. **Paciente:** Morador da comunidade remota. Acessa o sistema majoritariamente via smartphone básico. Necessita de interfaces altamente simplificadas, textos curtos e botões grandes devido ao potencial baixo letramento digital.
2. **Profissional de Saúde:** Médico, enfermeiro ou agente comunitário. Acessa via computador ou tablet nos postos de saúde. Necessita de uma interface de gestão (dashboard) para organizar filas, ler chamados e responder com orientações.

## 3. Requisitos Funcionais (RF)

**Módulo de Acesso e Perfil:**

* **RF01 - Cadastro e Autenticação:** O sistema deve permitir o cadastro de novos usuários utilizando e-mail e senha, exigindo a seleção do tipo de perfil (Paciente ou Profissional) e dados de contato básicos (nome, idade, celular).
* **RF02 - Redirecionamento Baseado no Perfil:** Após o login, o sistema deve direcionar o Paciente para a tela inicial simplificada de saúde e o Profissional para o painel de gestão de fila.

**Módulo do Paciente (Triagem e Acompanhamento):**

* **RF03 - Solicitação de Atendimento:** O paciente deve poder criar um chamado relatando seu problema. O formulário deve conter: motivo principal (lista suspensa), duração dos sintomas, descrição em texto livre, percepção de urgência e opção de anexar uma foto (ex: lesões de pele).
* **RF04 - Acompanhamento de Status:** O paciente deve visualizar uma lista de seus chamados anteriores e atuais, identificando claramente o status de cada um (Aguardando, Em Progresso, Concluído).
* **RF05 - Visualização da Resposta Médica:** O paciente deve conseguir abrir um chamado respondido para ler as recomendações do profissional e verificar se há indicação de encaminhamento presencial.

**Módulo do Profissional (Gestão de Fila):**

* **RF06 - Fila de Solicitações:** O profissional deve ter acesso a um painel listando todos os chamados abertos pelos pacientes, ordenados pela data de criação ou nível de urgência.
* **RF07 - Registro de Atendimento:** Ao abrir a solicitação de um paciente, o profissional deve poder visualizar os sintomas e a foto (se houver) e registrar uma resposta contendo: diagnóstico preliminar/orientação, recomendações de cuidados e uma marcação indicando se é necessário que o paciente vá fisicamente ao posto de saúde.
* **RF08 - Atualização de Status:** Ao enviar a resposta, o sistema deve automaticamente mudar o status da solicitação do paciente para "Concluído".

**Módulo de Educação em Saúde:**

* **RF09 - Biblioteca de Orientações:** O sistema deve disponibilizar uma área com cartilhas curtas e dicas de prevenção de doenças, primeiros socorros e higiene.
* **RF10 - Gestão de Conteúdo (Admin):** O profissional de saúde deve poder cadastrar, editar e excluir novos conteúdos educativos que aparecerão na biblioteca dos pacientes.


## 4. Requisitos Não Funcionais (RNF)

* **RNF01 - Usabilidade e Acessibilidade:** A interface voltada ao paciente deve seguir princípios de Desenho Universal (conforme manual da Uninter), possuindo alto contraste, fontes legíveis (mínimo 16px) e botões adequados para toque em telas de celular.
* **RNF02 - Responsividade:** A aplicação deve ser desenvolvida no modelo *Mobile-First* para pacientes (foco em telas pequenas) e adaptável para Desktop para a visão dos profissionais.
* **RNF03 - Segurança de Dados (RLS):** O banco de dados deve possuir políticas rigorosas de segurança em nível de linha (Row Level Security). O sistema deve garantir que um Paciente só consiga ler as suas próprias solicitações e fotos, bloqueando estritamente o acesso aos dados de outros usuários.
* **RNF04 - Desempenho e Armazenamento:** Imagens enviadas pelos pacientes devem ser limitadas a 5MB para economizar dados móveis e espaço em nuvem.


## 5. Estrutura Lógica de Dados (Entidades Mapeadas)

Para atender aos requisitos, a arquitetura de dados (no Supabase) deverá conter as seguintes entidades lógicas:

1. **Usuários (Profiles):** Armazena dados pessoais e o tipo de ator (Paciente/Profissional).
2. **Solicitações:** Armazena o relato do paciente, urgência, link da foto e status atual, vinculada ao Usuário que a criou.
3. **Atendimentos:** Armazena a resposta médica e necessidade de visita presencial, vinculada à Solicitação e ao Profissional que respondeu.
4. **Orientações Educativas:** Armazena o título e o conteúdo dos informativos de saúde, criados pelos profissionais.

## 6. Critérios de Aceite para o MVP Funcional

O software será considerado concluído para a entrega da **Atividade Extensionista III** quando:

* [ ] For possível criar duas contas diferentes (um paciente e um profissional).
* [ ] O paciente conseguir fazer o login, abrir uma nova solicitação e ler dicas de saúde.
* [ ] O profissional conseguir fazer o login, visualizar a solicitação aberta na fila e enviar uma recomendação médica de teste.
* [ ] O paciente, ao atualizar sua tela, conseguir ler a recomendação enviada pelo profissional.
* [ ] O fluxo completo rodar na web de forma estável (hospedado), permitindo a gravação de um vídeo curto ou extração de prints para o documento final.

