# Landing Page Admin - Implementation Plan

## Visão Geral
Construir um back-end e um painel de administração (`/admin/landing`) para tornar todas as seções principais da Landing Page (`src/app/page.tsx`) dinâmicas editáveis pelo administrador. Suportará rascunhos, publicação imediata e gerenciamento de arquivos (Supabase Storage ou URL direta).

## Fase 1: Arquitetura de Banco de Dados (Supabase)
Criaremos um sistema flexível usando JSONB e tabelas genéricas para não precisarmos de novas colunas toda vez que alterarmos a landing page.
- **Tabela:** `landing_page_sections`
  - `id` (uuid)
  - `section_id` (varchar, ex: "hero", "features", "brokers")
  - `content` (jsonb)
  - `status` (varchar: 'draft', 'published')
  - `updated_at` (timestamp, default now())
- **RLS Policies:**
  - `SELECT`: Acesso público (apenas para `status = 'published'`).
  - `SELECT`, `INSERT`, `UPDATE`, `DELETE`: Apenas Admin.
- **Supabase Storage:**
  - Criação do bucket `landing_assets` (Acesso público).
  - Policies para permitir upload apenas pelo Admin.

## Fase 2: Front-end (Painel Administrativo)
- Rota: `src/app/(auth)/admin/landing/page.tsx`
- **Componentes e Layout:**
  - Barra superior ou menu lateral com as seções em abas (Hero, Conversores, Corretoras, Rodapé).
  - Componente de **Upload de Imagem**:
    - Input de Arquivo para mandar para o Storage (Supabase).
    - Input de Texto para Inserir URL direta (Fallback/Alternativa).
  - Formulário dinâmico utilizando React Hook Form + Zod se necessário, para preencher campos do tipo titulo, subtilo, bullet points e URLs.
  - Action Bar fixo com botão "Salvar como Rascunho" e "Publicar Alterações".

## Fase 3: Integração na Landing Page `src/app/page.tsx`
- Refatorar os conteúdos que hoje se encontram *hardcoded* (Hero, Features/Customer Stories).
- Buscar as configurações da tabela `landing_page_sections` (`status = 'published'`).
- Criar estado de fallback exibindo os dados padrão em caso de primeira inicialização ou falta de dados (para que a página nunca fique quebrada em produção).

## Fase 4: Validação e Testes
- Efetuar a criação de uma alteração e submeter como `draft`. Verificar que a listagem pública não altera.
- Converter para `published` e verificar se a renderização no App Home atualiza imediatamente em tempo real.
- Auditar responsividade das imagens inseridas via link externo (URL).
- Executar linting e o script corporativo `python .agent/scripts/checklist.py .`

---
*Status: Aguardando aprovação do Admin para execução (Socratic Gate finalizado com sucesso).*
