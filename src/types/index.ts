export type ProjectStatus = 'ideia' | 'em_progresso' | 'concluido' | 'pausado';

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface ProjectImage {
  id: string;
  project_id: string;
  url: string;
  order: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  cover_image: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithRelations extends Project {
  tags: Tag[];
  images: ProjectImage[];
}
