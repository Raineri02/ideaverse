# 🧠 CLAUDE.md — Cérebro do Ideaverse v2

> Este arquivo é o "cérebro" do projeto. Sempre que quiser melhorar ou evoluir o app,
> compartilhe este arquivo numa nova conversa com o Claude. Ele contém toda a visão,
> arquitetura e decisões técnicas para que o Claude entenda o contexto completo.

---

## 🌌 Visão do Projeto

**Ideaverse** é um app mobile (Expo + React Native) premium para organizar projetos e ideias.
O nome significa *"Universo de Ideias"* — um espaço pessoal onde cada ideia tem vida e forma.

**Público-alvo:** Desenvolvedores, designers e empreendedores criativos que querem:
- Nunca perder uma ideia
- Organizar projetos com riqueza visual e textual
- Acompanhar o progresso com um dashboard bonito

---

## ✅ Funcionalidades v2.0 (implementadas)

- [x] Lista de projetos com busca em tempo real (título, descrição, tags)
- [x] Visualização em lista ou grid (toggle animado)
- [x] Ordenação por: mais recente, data de criação, nome
- [x] Filtros por status e por tag
- [x] Swipe para deletar nos cards da lista
- [x] Cards com animação de entrada escalonada
- [x] Skeleton loading enquanto carrega dados
- [x] Empty states animados (pulsando)
- [x] Toast notifications (sucesso, erro, info)
- [x] Haptic feedback em ações importantes
- [x] Tela de detalhe com header parallax
- [x] Descrição rich em Markdown (estilo README GitHub)
- [x] Upload de capa e galeria de imagens por projeto
- [x] Status coloridos com badge (Ideia / Em Progresso / Concluído / Pausado)
- [x] Tags coloridas customizáveis com preview ao criar
- [x] Dashboard de estatísticas com barras animadas
- [x] Integração completa com Supabase (banco + storage)

---

## 🚀 Backlog / Próximas Features

- [ ] Onboarding animado (primeira vez que abre o app)
- [ ] Modo offline com sync automático
- [ ] Compartilhar projeto como link público
- [ ] Exportar projeto como PDF ou imagem
- [ ] Colaboração: convidar outras pessoas para um projeto
- [ ] Integração com GitHub (vincular repositório)
- [ ] Notificações de lembrete por projeto
- [ ] Widget na home do celular
- [ ] IA integrada: sugerir próximos passos com base na descrição
- [ ] Busca global com highlight no resultado
- [ ] Reordenar projetos por drag-and-drop
- [ ] Arquivar projetos (sem deletar)
- [ ] Exportar backup dos dados

---

## 🏗️ Arquitetura

### Stack Completa
| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Expo | ~51.0 |
| Navegação | Expo Router (file-based) | ~3.5 |
| Banco | Supabase (PostgreSQL) | ^2.43 |
| Storage | Supabase Storage | — |
| Animações | React Native Animated API | nativo |
| Markdown | react-native-markdown-display | ^7.0 |
| Haptics | expo-haptics | ~13.0 |
| Fontes | Sora + DM Sans | Google Fonts |
| Tipos | TypeScript | ~5.3 |

### Estrutura de Pastas
```
ideaverse/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx        # Home — lista/grid + busca + filtros
│   │   ├── tags.tsx         # Gerenciar tags com preview
│   │   └── stats.tsx        # Dashboard com barras animadas
│   ├── project/
│   │   ├── [id].tsx         # Detalhe com parallax header
│   │   ├── new.tsx          # Criar projeto
│   │   └── edit/[id].tsx    # Editar projeto
│   └── _layout.tsx          # Root layout + ToastProvider
├── src/
│   ├── lib/
│   │   ├── supabase.ts      # Cliente + helpers de upload
│   │   └── theme.ts         # Design system completo
│   ├── components/
│   │   ├── ProjectCard.tsx  # Card com swipe + animações
│   │   ├── Skeleton.tsx     # Loading skeleton
│   │   └── ToastProvider.tsx# Notificações globais
│   ├── hooks/
│   │   └── useProjects.ts   # Hooks: useProjects, useProject, useTags, useStats
│   ├── types/
│   │   └── index.ts         # TypeScript types
│   └── utils/
│       └── toast.ts         # Sistema de toast
├── assets/fonts/            # Sora-Regular/SemiBold/Bold + DMSans-Regular/Medium
├── supabase-schema.sql      # Schema completo do banco
├── CLAUDE.md                # Este arquivo
└── README.md
```

---

## 🎨 Design System

### Paleta de Cores
```
Backgrounds:
  bg:          #080810  ← fundo principal
  bgCard:      #0F0F1A  ← cards e superfícies
  bgElevated:  #14141F  ← elementos elevados
  bgHover:     #1A1A2E  ← hover/press states

Bordas:
  border:      #1E1E35
  borderLight: #2A2A45
  borderGlow:  #6C63FF44  ← bordas com brilho roxo

Brand:
  primary:     #6C63FF  ← roxo elétrico
  primaryGlow: #6C63FF30

Accents:
  cyan:        #00D4FF  ← ideias
  pink:        #FF6B9D  ← destaque
  amber:       #FFB547  ← em progresso
  emerald:     #00E5A0  ← concluído

Texto:
  text:        #F0F0FF
  textSub:     #9090B8
  textMuted:   #50507A
```

### Tipografia
- **Display/Bold:** Sora-Bold, Sora-SemiBold
- **Body/UI:** DMSans-Regular, DMSans-Medium

### Animações Usadas
- `Animated.spring` — entradas de cards, modais, toasts
- `Animated.loop + sequence` — skeleton pulse, empty state
- `PanResponder` — swipe para deletar
- `Animated.Value` parallax — header do detalhe do projeto
- Escalonamento por index — cards entram em sequência

---

## 🗄️ Schema do Banco (Supabase)

### Tabelas
- `projects` — título, descrição (markdown), status, cover_image, timestamps
- `tags` — nome, cor hex
- `project_tags` — relação N:N entre projects e tags
- `project_images` — galeria de imagens por projeto (com ordem)

### Storage
- Bucket: `project-images` (público)
- Capas: `covers/{timestamp}.jpg`
- Galeria: `projects/{project_id}/{timestamp}-{index}.jpg`

---

## ⚙️ Decisões Técnicas

1. **Expo Router** — navegação file-based moderna, suporte a modals e deep links
2. **Animated API nativa** — preferida sobre Reanimated para compatibilidade máxima
3. **Supabase** — PostgreSQL real + Storage + sem backend próprio necessário
4. **Sem autenticação v2** — todos os dados são públicos (sem RLS); adicionar auth na v3
5. **Haptic feedback** — melhora percepção de qualidade do app drasticamente
6. **Toast system global** — via registro de função no módulo, sem Context API extra
7. **Skeleton loading** — nunca mostrar tela em branco, sempre feedback visual

---

## 🧪 TDD — Filosofia e Estratégia de Testes

Este projeto segue **Test-Driven Development (TDD)** para garantir qualidade e confiança ao evoluir o código.

### O que é TDD neste projeto?
> Antes de implementar uma funcionalidade, escreve-se o teste que descreve o comportamento esperado.
> Só então o código de produção é escrito para fazer o teste passar.

### Ciclo TDD (Red → Green → Refactor)
```
1. RED    → Escreve o teste. Ele falha porque o código não existe ainda.
2. GREEN  → Escreve o mínimo de código para o teste passar.
3. REFACTOR → Melhora o código sem quebrar os testes.
```

### Cobertura de Testes Atual

| Arquivo | Testes | O que cobre |
|---------|--------|-------------|
| `__tests__/utils/toast.test.ts` | 5 | Registro, disparo, tipos, substituição de handler |
| `__tests__/utils/supabase.test.ts` | 5 | decode base64, uploadImage sucesso/falha/path |
| `__tests__/utils/onboarding.test.ts` | 7 | hasSeenOnboarding, markOnboardingSeen, AsyncStorage, erros |
| `__tests__/hooks/useProjects.test.ts` | 16 | loading, mapeamento, filtros, erro, sort, stats |
| `__tests__/hooks/useAuth.test.tsx` | 7 | sessão, login, logout, auth state change, unmount |
| `__tests__/components/ProjectCard.test.tsx` | 10 | render, navegação, grid mode, delete, tags |
| `__tests__/components/Skeleton.test.tsx` | 5 | render, dimensões, radius, múltiplos skeletons |
| `__tests__/components/ToastProvider.test.tsx` | 6 | sucesso, erro, info, múltiplos, timeout |
| `__tests__/components/IdeaverseLogo.test.tsx` | 8 | render, tamanhos, animate, elementos SVG |
| `__tests__/screens/Login.test.tsx` | 11 | render, validação, login, navegação, erros, trim |
| `__tests__/screens/Register.test.tsx` | 8 | render, validação, cadastro, erro email duplicado |
| `__tests__/screens/ForgotPassword.test.tsx` | 7 | render, validação, envio, sucesso, erro, navegação |
| `__tests__/screens/Onboarding.test.tsx` | 7 | render, navegação, Pular, slides, markOnboardingSeen |

**Total: 102 testes automatizados** ✅

### Como Rodar os Testes
```bash
# Todos os testes
npm test

# Modo watch (roda ao salvar)
npm run test:watch

# Com relatório de cobertura
npm run test:coverage
```

### Regra para Novas Features
Ao adicionar qualquer funcionalidade nova, seguir esta ordem:
1. Criar o arquivo de teste em `__tests__/`
2. Escrever os casos de teste descrevendo o comportamento
3. Implementar o código até todos os testes passarem
4. Refatorar mantendo os testes verdes

---

## 🐛 Bugs Corrigidos (v2.0.1)

| # | Arquivo | Bug | Correção |
|---|---------|-----|----------|
| 1 | `utils/toast.ts` | Import `Animated` não utilizado | Removido |
| 2 | `hooks/useProjects.ts` | `useProject` não definia `loading=false` se `id` vazio | Adicionado guard + finally |
| 3 | `hooks/useProjects.ts` | `useTags` sem try/catch — crash silencioso | Adicionado try/catch/finally |
| 4 | `components/ProjectCard.tsx` | `useEffect` sem dependência `index` | Adicionado `index` no array |
| 5 | `components/ProjectCard.tsx` | Alert dismiss sem resetar swipeX | Adicionado `onDismiss` callback |
| 6 | `app/project/[id].tsx` | `Animated.Image` não existe no RN | Substituído por `createAnimatedComponent(Image)` |
| 7 | `app/(tabs)/index.tsx` | Variável `s2` sombreava StyleSheet `s` | Renomeado para `sortVal` |

---


Quando quiser evoluir o app, abra uma conversa e diga:
> *"Aqui está o CLAUDE.md do Ideaverse v2. Quero implementar: [funcionalidade do backlog]."*

O Claude vai entender a arquitetura e respeitar os padrões existentes.

---

## 🎨 Logo — Cosmic (Opção 1)

Logo escolhido: **Cosmic** — anéis orbitais com letra "I" central, gradiente roxo-ciano.

- Componente: `src/components/IdeaverseLogo.tsx`
- Versões: `IdeaverseLogo` (tamanho livre) e `IdeaVerseLogoSmall` (compacto)
- Suporta prop `animate={true}` para rotação dos anéis
- Dependência: `react-native-svg`

---

## 🔐 Autenticação (v2.1)

Stack: **Supabase Auth** (email/password nativo)

### Fluxo de navegação
```
App abre
 ├── Primeira vez → /onboarding (3 slides animados)
 │                      └── /auth/login
 ├── Sem sessão   → /auth/login
 │    ├── /auth/register  (criar conta)
 │    └── /auth/forgot    (recuperar senha)
 └── Com sessão   → /(tabs) (app principal)
```

### Arquivos
| Arquivo | Função |
|---------|--------|
| `src/hooks/useAuth.ts` | Context + hook de sessão global |
| `app/auth/login.tsx` | Login com email/senha |
| `app/auth/register.tsx` | Cadastro com nome/email/senha |
| `app/auth/forgot.tsx` | Recuperação de senha por email |
| `app/onboarding.tsx` | 3 slides animados de boas-vindas |
| `src/utils/onboarding.ts` | Flag "já viu" via AsyncStorage |

### RLS (Row Level Security)
- Cada usuário vê/edita **apenas seus dados**
- `user_id` setado via trigger automático
- Schema: `supabase-schema-v2-auth.sql`

---

## 📦 Tela de Perfil (4ª aba)

- Avatar com iniciais do nome
- Mini dashboard de stats pessoais
- Configurações (notificações, tema)
- Botão de logout com confirmação

---

*v2.1.0 — Abril 2026*
