-- ============================================================
-- IDEAVERSE v2 — Schema com Autenticação e RLS
-- Execute no Supabase > SQL Editor
-- ============================================================

-- Enum de status
CREATE TYPE project_status AS ENUM ('ideia', 'em_progresso', 'concluido', 'pausado');

-- ── Tabela: projects ────────────────────────────────────────
CREATE TABLE projects (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title       TEXT NOT NULL,
  description TEXT DEFAULT '',
  status      project_status DEFAULT 'ideia',
  cover_image TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Tabela: tags ────────────────────────────────────────────
CREATE TABLE tags (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name       TEXT NOT NULL,
  color      TEXT DEFAULT '#6C63FF',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, name)
);

-- ── Tabela: project_tags ────────────────────────────────────
CREATE TABLE project_tags (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tag_id     UUID REFERENCES tags(id)     ON DELETE CASCADE,
  PRIMARY KEY (project_id, tag_id)
);

-- ── Tabela: project_images ──────────────────────────────────
CREATE TABLE project_images (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  "order"    INT  DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Auto updated_at ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── RLS: projects ───────────────────────────────────────────
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own projects"
  ON projects FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own projects"
  ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own projects"
  ON projects FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own projects"
  ON projects FOR DELETE USING (auth.uid() = user_id);

-- ── RLS: tags ───────────────────────────────────────────────
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own tags"
  ON tags FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own tags"
  ON tags FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own tags"
  ON tags FOR DELETE USING (auth.uid() = user_id);

-- ── RLS: project_tags ───────────────────────────────────────
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own project_tags"
  ON project_tags FOR ALL
  USING (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
  );

-- ── RLS: project_images ─────────────────────────────────────
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own project_images"
  ON project_images FOR ALL
  USING (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
  );

-- ── Storage ─────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT DO NOTHING;

-- Usuários só acessam sua própria pasta no storage
CREATE POLICY "Users manage own images"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'project-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ── Função: auto user_id no insert ──────────────────────────
-- Garante que user_id seja sempre o usuário logado
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER projects_set_user_id
  BEFORE INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION set_user_id();

CREATE TRIGGER tags_set_user_id
  BEFORE INSERT ON tags
  FOR EACH ROW EXECUTE FUNCTION set_user_id();

-- ── Tags padrão (criadas via trigger após cadastro) ──────────
-- Execute isso manualmente se quiser tags globais de exemplo
-- ou deixe o usuário criar as suas próprias
