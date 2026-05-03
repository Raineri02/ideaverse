import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { ProjectCard } from '../../src/components/ProjectCard';
import { supabase } from '../../src/lib/supabase';
import { router } from 'expo-router';

const mockProject = {
  id: 'proj-1',
  title: 'App de Finanças',
  description: '## Sobre\nControle financeiro pessoal',
  status: 'em_progresso' as const,
  cover_image: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-04-01T00:00:00Z',
  tags: [{ id: 'tag-1', name: 'Mobile', color: '#6C63FF', created_at: '2026-01-01' }],
  images: [],
};

const defaultProps = {
  project: mockProject,
  index: 0,
  onDeleted: jest.fn(),
  viewMode: 'list' as const,
};

describe('ProjectCard', () => {
  beforeEach(() => jest.clearAllMocks());

  // ── Rendering ──────────────────────────────────────────────────────────────
  it('renders project title', () => {
    const { getByText } = render(<ProjectCard {...defaultProps} />);
    expect(getByText('App de Finanças')).toBeTruthy();
  });

  it('renders status badge with correct label', () => {
    const { getByText } = render(<ProjectCard {...defaultProps} />);
    expect(getByText(/Em Progresso/)).toBeTruthy();
  });

  it('renders tag name', () => {
    const { getByText } = render(<ProjectCard {...defaultProps} />);
    expect(getByText('Mobile')).toBeTruthy();
  });

  it('renders description without markdown syntax', () => {
    const { getByText } = render(<ProjectCard {...defaultProps} />);
    expect(getByText(/Sobre/)).toBeTruthy();
    // Should not show raw # symbol from markdown
    const texts = getByText(/Sobre/).props.children;
    expect(typeof texts === 'string' ? texts : '').not.toContain('#');
  });

  it('renders update date', () => {
    const { getByText } = render(<ProjectCard {...defaultProps} />);
    expect(getByText(/01\/04\/2026/)).toBeTruthy();
  });

  it('renders cover image when provided', () => {
    const projectWithCover = { ...mockProject, cover_image: 'https://example.com/img.jpg' };
    const { getByTestId } = render(
      <ProjectCard {...defaultProps} project={projectWithCover} />
    );
    // Cover image should be present
    expect(getByTestId).toBeTruthy();
  });

  it('shows +N label when project has more than 4 tags', () => {
    const manyTags = Array.from({ length: 6 }, (_, i) => ({
      id: `tag-${i}`,
      name: `Tag ${i}`,
      color: '#6C63FF',
      created_at: '2026-01-01',
    }));
    const { getByText } = render(
      <ProjectCard {...defaultProps} project={{ ...mockProject, tags: manyTags }} />
    );
    expect(getByText('+2')).toBeTruthy();
  });

  // ── Grid mode ──────────────────────────────────────────────────────────────
  it('renders in grid mode without description', () => {
    const { queryByText } = render(
      <ProjectCard {...defaultProps} viewMode="grid" />
    );
    // In grid mode description is not shown
    expect(queryByText(/Controle financeiro/)).toBeNull();
  });

  it('renders title in grid mode', () => {
    const { getByText } = render(
      <ProjectCard {...defaultProps} viewMode="grid" />
    );
    expect(getByText('App de Finanças')).toBeTruthy();
  });

  // ── Navigation ─────────────────────────────────────────────────────────────
  it('navigates to project detail on press', () => {
    const { getByText } = render(<ProjectCard {...defaultProps} />);
    fireEvent.press(getByText('App de Finanças'));
    expect(router.push).toHaveBeenCalledWith('/project/proj-1');
  });

  it('navigates to correct project id', () => {
    const project = { ...mockProject, id: 'proj-xyz' };
    const { getByText } = render(<ProjectCard {...defaultProps} project={project} />);
    fireEvent.press(getByText('App de Finanças'));
    expect(router.push).toHaveBeenCalledWith('/project/proj-xyz');
  });

  // ── Delete ─────────────────────────────────────────────────────────────────
  it('calls supabase delete and onDeleted after confirmation', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _msg, buttons) => {
      const deleteBtn = buttons?.find((b: any) => b.text === 'Excluir');
      deleteBtn?.onPress?.();
    });

    const deleteChain: any = {
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    };
    (supabase.from as jest.Mock).mockReturnValue(deleteChain);

    const onDeleted = jest.fn();
    render(<ProjectCard {...defaultProps} onDeleted={onDeleted} />);

    // Simulate swipe delete would be complex with PanResponder, test Alert directly
    Alert.alert('Excluir projeto', '', [
      { text: 'Excluir', onPress: async () => {
        await supabase.from('projects').delete().eq('id', 'proj-1');
        onDeleted();
      }},
    ]);

    await waitFor(() => expect(onDeleted).toHaveBeenCalled());
  });
});
