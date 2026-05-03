# 🌌 Ideaverse v2.1

> **Seu universo de ideias** — App mobile premium para organizar projetos com autenticação, logo Cosmic e design profissional.

---

## ✨ Funcionalidades

| Feature | Status |
|---------|--------|
| 🔐 Login / Cadastro / Logout | ✅ |
| 🚀 Onboarding animado (3 slides) | ✅ |
| 🌌 Logo Cosmic SVG animado | ✅ |
| 📋 Projetos com Markdown | ✅ |
| 🖼️ Capa e galeria de imagens | ✅ |
| 🏷️ Tags coloridas | ✅ |
| 📊 Dashboard com estatísticas | ✅ |
| 👤 Perfil com edição de nome/senha | ✅ |
| 🔍 Busca em tempo real | ✅ |
| ⊞ Grid / Lista | ✅ |
| 🎭 Animações e haptic feedback | ✅ |
| 🛡️ RLS — dados isolados por usuário | ✅ |
| 🧪 102 testes automatizados | ✅ |

---

## 🚀 Como Rodar

### 1. Pré-requisitos
- Node.js 18+
- App **Expo Go** no celular (mesma rede Wi-Fi)

### 2. Clone e instale
```bash
git clone https://github.com/SEU_USUARIO/ideaverse.git
cd ideaverse
npm install
```

### 3. Configure o Supabase (apenas 1x)

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Vá em **SQL Editor → New Query**
3. Cole e execute **`supabase-schema-v2-auth.sql`**
4. Em **Authentication → Providers**, confirme que **Email** está habilitado

> ⚠️ Use `supabase-schema-v2-auth.sql` — não o `supabase-schema.sql` antigo.

### 4. Instale as fontes

Baixe e coloque em `assets/fonts/`:

| Fonte | Link | Arquivos necessários |
|-------|------|---------------------|
| Sora | [fonts.google.com/specimen/Sora](https://fonts.google.com/specimen/Sora) | Sora-Regular.ttf, Sora-SemiBold.ttf, Sora-Bold.ttf |
| DM Sans | [fonts.google.com/specimen/DM+Sans](https://fonts.google.com/specimen/DM+Sans) | DMSans-Regular.ttf, DMSans-Medium.ttf |

### 5. Rode
```bash
npm start
```
Escaneie o QR Code com o **Expo Go**. 🎉

---

## 🧪 Testes
```bash
npm test                 # todos os 102 testes
npm run test:watch       # modo watch
npm run test:coverage    # cobertura
```

---

## 🗄️ Estrutura
```
ideaverse/
├── app/
│   ├── (tabs)/          # Home, Tags, Stats, Perfil
│   ├── auth/            # Login, Cadastro, Esqueci senha
│   ├── profile/         # Editar perfil (nome/senha)
│   ├── project/         # Detalhe, Criar, Editar
│   └── onboarding.tsx
├── src/
│   ├── components/      # ProjectCard, Skeleton, Toast, Logo
│   ├── hooks/           # useProjects, useAuth
│   ├── lib/             # Supabase, Theme
│   └── utils/           # toast, onboarding
├── assets/
│   ├── fonts/           # ← adicionar manualmente
│   ├── icon.png
│   └── splash.png
├── __tests__/           # 102 testes
├── supabase-schema-v2-auth.sql  # ← usar este
└── CLAUDE.md
```

---

## 🧠 Evoluindo o app

Compartilhe o **[CLAUDE.md](./CLAUDE.md)** com o Claude para continuar desenvolvendo com todo o contexto.

---
MIT © Ideaverse 2026
