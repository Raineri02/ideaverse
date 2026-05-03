import { renderHook, waitFor } from '@testing-library/react-native';
import { useProjects, useProject, useTags, useStats } from '../../src/hooks/useProjects';
import { supabase } from '../../src/lib/supabase';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const mockProject = {
  id: 'proj-1',
  title: 'App de Finanças',
  description: '## Sobre\nControle financeiro',
  status: 'em_progresso',
  cover_image: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-04-01T00:00:00Z',
  tags: [{ tag: { id: 'tag-1', name: 'Mobile', color: '#6C63FF', created_at: '2026-01-01' } }],
  images: [],
};

const mockTag = { id: 'tag-1', name: 'Mobile', color: '#6C63FF', created_at: '2026-01-01' };

function mockSupabaseChain(resolvedValue: any) {
  const chain: any = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(resolvedValue),
    then: jest.fn((cb: any) => Promise.resolve(resolvedValue).then(cb)),
  };
  (supabase.from as jest.Mock).mockReturnValue(chain);
  return chain;
}

// ─── useProjects ─────────────────────────────────────────────────────────────
describe('useProjects', () => {
  beforeEach(() => jest.clearAllMocks());

  it('starts with loading true and empty array', () => {
    mockSupabaseChain({ data: [], error: null });
    const { result } = renderHook(() => useProjects());
    expect(result.current.loading).toBe(true);
    expect(result.current.projects).toEqual([]);
  });

  it('loads and maps projects correctly', async () => {
    const chain = mockSupabaseChain({ data: [mockProject], error: null });
    chain.then = jest.fn((cb: any) => Promise.resolve({ data: [mockProject], error: null }).then(cb));

    const { result } = renderHook(() => useProjects());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.projects.length).toBe(1);
    expect(result.current.projects[0].title).toBe('App de Finanças');
  });

  it('sets error message when supabase fails', async () => {
    const chain = mockSupabaseChain({ data: null, error: { message: 'Network error' } });
    chain.then = jest.fn((cb: any) => Promise.resolve({ data: null, error: { message: 'Network error' } }).then(cb));

    const { result } = renderHook(() => useProjects());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Network error');
    expect(result.current.projects).toEqual([]);
  });

  it('filters projects by search term in title', async () => {
    const projects = [
      { ...mockProject, id: '1', title: 'App de Finanças', tags: [], images: [] },
      { ...mockProject, id: '2', title: 'Portfolio 3D', tags: [], images: [] },
    ];
    const chain = mockSupabaseChain({ data: projects, error: null });
    chain.then = jest.fn((cb: any) => Promise.resolve({ data: projects, error: null }).then(cb));

    const { result } = renderHook(() => useProjects(undefined, undefined, 'finanças'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.projects.length).toBe(1);
    expect(result.current.projects[0].title).toBe('App de Finanças');
  });

  it('filters projects by search term in description', async () => {
    const projects = [
      { ...mockProject, id: '1', title: 'Projeto A', description: 'usa React Native', tags: [], images: [] },
      { ...mockProject, id: '2', title: 'Projeto B', description: 'usa Flutter', tags: [], images: [] },
    ];
    const chain = mockSupabaseChain({ data: projects, error: null });
    chain.then = jest.fn((cb: any) => Promise.resolve({ data: projects, error: null }).then(cb));

    const { result } = renderHook(() => useProjects(undefined, undefined, 'flutter'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.projects.length).toBe(1);
    expect(result.current.projects[0].title).toBe('Projeto B');
  });

  it('filters projects by tag id', async () => {
    const projects = [
      { ...mockProject, id: '1', title: 'Com Tag', tags: [{ tag: mockTag }], images: [] },
      { ...mockProject, id: '2', title: 'Sem Tag', tags: [], images: [] },
    ];
    const chain = mockSupabaseChain({ data: projects, error: null });
    chain.then = jest.fn((cb: any) => Promise.resolve({ data: projects, error: null }).then(cb));

    const { result } = renderHook(() => useProjects('tag-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.projects.length).toBe(1);
    expect(result.current.projects[0].title).toBe('Com Tag');
  });

  it('sorts images by order field', async () => {
    const projectWithImages = {
      ...mockProject,
      tags: [],
      images: [
        { id: 'img-2', order: 1, url: 'b.jpg' },
        { id: 'img-1', order: 0, url: 'a.jpg' },
      ],
    };
    const chain = mockSupabaseChain({ data: [projectWithImages], error: null });
    chain.then = jest.fn((cb: any) => Promise.resolve({ data: [projectWithImages], error: null }).then(cb));

    const { result } = renderHook(() => useProjects());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.projects[0].images[0].url).toBe('a.jpg');
    expect(result.current.projects[0].images[1].url).toBe('b.jpg');
  });

  it('exposes refetch function that reloads data', async () => {
    const chain = mockSupabaseChain({ data: [], error: null });
    chain.then = jest.fn((cb: any) => Promise.resolve({ data: [], error: null }).then(cb));

    const { result } = renderHook(() => useProjects());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(typeof result.current.refetch).toBe('function');
    result.current.refetch();
    expect(result.current.loading).toBe(true);
  });
});

// ─── useProject ──────────────────────────────────────────────────────────────
describe('useProject', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns null when id is empty', async () => {
    const { result } = renderHook(() => useProject(''));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.project).toBeNull();
  });

  it('loads single project and maps relations', async () => {
    mockSupabaseChain({ data: mockProject, error: null });

    const { result } = renderHook(() => useProject('proj-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.project).not.toBeNull();
    expect(result.current.project?.title).toBe('App de Finanças');
    expect(result.current.project?.tags[0].name).toBe('Mobile');
  });

  it('returns null project on supabase error', async () => {
    mockSupabaseChain({ data: null, error: { message: 'Not found' } });

    const { result } = renderHook(() => useProject('invalid-id'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.project).toBeNull();
  });

  it('exposes refetch function', async () => {
    mockSupabaseChain({ data: mockProject, error: null });

    const { result } = renderHook(() => useProject('proj-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(typeof result.current.refetch).toBe('function');
  });
});

// ─── useTags ─────────────────────────────────────────────────────────────────
describe('useTags', () => {
  beforeEach(() => jest.clearAllMocks());

  it('starts loading and returns empty array', () => {
    const chain: any = { select: jest.fn().mockReturnThis(), order: jest.fn().mockReturnThis(), then: jest.fn() };
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const { result } = renderHook(() => useTags());
    expect(result.current.loading).toBe(true);
    expect(result.current.tags).toEqual([]);
  });

  it('loads tags ordered by name', async () => {
    const tags = [
      { id: 'tag-2', name: 'Web', color: '#00D4FF', created_at: '2026-01-01' },
      { id: 'tag-1', name: 'Mobile', color: '#6C63FF', created_at: '2026-01-01' },
    ];
    const chain: any = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      then: jest.fn((cb: any) => Promise.resolve({ data: tags, error: null }).then(cb)),
    };
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const { result } = renderHook(() => useTags());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.tags.length).toBe(2);
  });

  it('returns empty array on error', async () => {
    const chain: any = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      then: jest.fn((cb: any) => Promise.resolve({ data: null, error: { message: 'fail' } }).then(cb)),
    };
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const { result } = renderHook(() => useTags());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.tags).toEqual([]);
  });
});

// ─── useStats ────────────────────────────────────────────────────────────────
describe('useStats', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns initial zero stats', () => {
    const chain: any = {
      select: jest.fn().mockReturnThis(),
      then: jest.fn(),
    };
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const { result } = renderHook(() => useStats());
    expect(result.current.total).toBe(0);
    expect(result.current.ideia).toBe(0);
    expect(result.current.concluido).toBe(0);
  });

  it('counts projects by status correctly', async () => {
    const data = [
      { status: 'ideia' },
      { status: 'ideia' },
      { status: 'em_progresso' },
      { status: 'concluido' },
      { status: 'concluido' },
      { status: 'concluido' },
    ];
    const chain: any = {
      select: jest.fn().mockReturnThis(),
      then: jest.fn((cb: any) => Promise.resolve({ data, error: null }).then(cb)),
    };
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const { result } = renderHook(() => useStats());
    await waitFor(() => expect(result.current.total).toBe(6));

    expect(result.current.ideia).toBe(2);
    expect(result.current.em_progresso).toBe(1);
    expect(result.current.concluido).toBe(3);
    expect(result.current.pausado).toBe(0);
  });

  it('handles empty projects list', async () => {
    const chain: any = {
      select: jest.fn().mockReturnThis(),
      then: jest.fn((cb: any) => Promise.resolve({ data: [], error: null }).then(cb)),
    };
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const { result } = renderHook(() => useStats());
    await waitFor(() => expect(result.current.total).toBe(0));

    expect(result.current.total).toBe(0);
  });
});
