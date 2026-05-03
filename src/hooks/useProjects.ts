import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { ProjectWithRelations, Tag, ProjectStatus } from '../types';

// With RLS enabled, Supabase automatically filters by auth.uid()
// No manual user_id filtering needed in queries

export function useProjects(filterTag?: string, filterStatus?: ProjectStatus | null, search?: string) {
  const [projects, setProjects] = useState<ProjectWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase
        .from('projects')
        .select(`*, tags:project_tags(tag:tags(*)), images:project_images(*)`)
        .order('updated_at', { ascending: false });

      if (filterStatus) q = q.eq('status', filterStatus);

      const { data, error } = await q;
      if (error) throw error;

      let mapped = (data || []).map((p: any) => ({
        ...p,
        tags: p.tags?.map((t: any) => t.tag).filter(Boolean) || [],
        images: (p.images || []).sort((a: any, b: any) => a.order - b.order),
      }));

      if (filterTag) mapped = mapped.filter((p) => p.tags.some((t: Tag) => t.id === filterTag));
      if (search?.trim()) {
        const s = search.toLowerCase();
        mapped = mapped.filter((p) =>
          p.title.toLowerCase().includes(s) ||
          p.description?.toLowerCase().includes(s) ||
          p.tags.some((t: Tag) => t.name.toLowerCase().includes(s))
        );
      }

      setProjects(mapped);
    } catch (e: any) {
      const isNetwork = e?.message?.includes('fetch') || e?.message?.includes('network') || e?.code === 'NETWORK_ERROR';
      setError(isNetwork ? 'Sem conexão. Verifique sua internet.' : e.message);
    } finally {
      setLoading(false);
    }
  }, [filterTag, filterStatus, search]);

  useEffect(() => { fetch(); }, [fetch]);
  return { projects, loading, error, refetch: fetch };
}

export function useProject(id: string) {
  const [project, setProject] = useState<ProjectWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`*, tags:project_tags(tag:tags(*)), images:project_images(*)`)
        .eq('id', id)
        .single();
      if (error) throw error;
      if (data) {
        setProject({
          ...data,
          tags: data.tags?.map((t: any) => t.tag).filter(Boolean) || [],
          images: (data.images || []).sort((a: any, b: any) => a.order - b.order),
        });
      }
    } catch (_) {
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);
  return { project, loading, refetch: fetch };
}

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const { data } = await supabase.from('tags').select('*').order('name');
      if (data) setTags(data);
    } catch (_) {
      setTags([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { tags, loading, refetch: fetch };
}

export function useStats() {
  const [stats, setStats] = useState({ total: 0, ideia: 0, em_progresso: 0, concluido: 0, pausado: 0 });

  useEffect(() => {
    supabase.from('projects').select('status').then(({ data }) => {
      if (!data) return;
      const s = { total: data.length, ideia: 0, em_progresso: 0, concluido: 0, pausado: 0 };
      data.forEach((p: any) => { if (p.status in s) (s as any)[p.status]++; });
      setStats(s);
    });
  }, []);

  return stats;
}
