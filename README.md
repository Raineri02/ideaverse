# 🌌 Ideaverse

> **Seu universo de ideias** — App mobile premium para organizar projetos com autenticação, logo Cosmic e design profissional.

---

## 🚀 Como Rodar

### 1. Pré-requisitos
- Node.js 18+
- App **Expo Go** no celular (mesma rede Wi-Fi)

### 2. Clone e instale
```bash
git clone https://github.com/Raineri02/ideaverse.git
cd ideaverse
npm install
```

### 3. Configure o Supabase (apenas 1x)

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Vá em **SQL Editor → New Query**
3. Cole e execute **`supabase-schema-v2-auth.sql`**
4. Em **Authentication → Providers**, confirme que **Email** está habilitado

> ⚠️ Use `supabase-schema-v2-auth.sql` — não o `supabase-schema.sql` antigo.

### 4. Rode
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
## 🧠 Evoluindo o app

Compartilhe o **[CLAUDE.md](./CLAUDE.md)** com o Claude para continuar desenvolvendo com todo o contexto.

---
MIT © Ideaverse 2026
