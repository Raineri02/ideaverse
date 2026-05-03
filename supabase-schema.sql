-- ============================================
-- IDEAVERSE v2 — Schema do Banco de Dados
-- Execute no Supabase > SQL Editor
-- ============================================

-- Enum de status
CREATE TYPE project_status AS ENUM ('ideia', 'em_progresso', 'concluido', 'pausado');

-- Projetos
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status project_status DEFAULT 'ideia',
  cover_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags
CREATE TABLE tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#6C63FF',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projeto <-> Tags
CREATE TABLE project_tags (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, tag_id)
);

-- Imagens dos projetos
CREATE TABLE project_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Storage bucket público
INSERT INTO storage.buckets (id, name, public) VALUES ('project-images', 'project-images', true);
CREATE POLICY "Public Access" ON storage.objects FOR ALL USING (bucket_id = 'project-images');

-- Tags padrão
INSERT INTO tags (name, color) VALUES
  ('Mobile', '#6C63FF'),
  ('Web', '#00D4FF'),
  ('IA', '#FF6B9D'),
  ('Design', '#FFB547'),
  ('Backend', '#00E5A0'),
  ('Pesquisa', '#FF4D6A'),
  ('Negócio', '#A78BFA'),
  ('Pessoal', '#8B8FA8'),
  ('Open Source', '#34D399'),
  ('Freelance', '#FBBF24');
