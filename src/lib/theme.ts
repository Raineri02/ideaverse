export const theme = {
  colors: {
    // Backgrounds
    bg: '#080810',
    bgCard: '#0F0F1A',
    bgElevated: '#14141F',
    bgHover: '#1A1A2E',

    // Borders
    border: '#1E1E35',
    borderLight: '#2A2A45',
    borderGlow: '#6C63FF44',

    // Brand
    primary: '#6C63FF',
    primaryLight: '#8B84FF',
    primaryDark: '#4B44CC',
    primaryGlow: '#6C63FF30',

    // Accents
    cyan: '#00D4FF',
    cyanGlow: '#00D4FF25',
    pink: '#FF6B9D',
    pinkGlow: '#FF6B9D25',
    amber: '#FFB547',
    amberGlow: '#FFB54725',
    emerald: '#00E5A0',
    emeraldGlow: '#00E5A025',

    // Text
    text: '#F0F0FF',
    textSub: '#9090B8',
    textMuted: '#50507A',
    textDisabled: '#30304A',

    // Status
    success: '#00E5A0',
    warning: '#FFB547',
    error: '#FF4D6A',
    info: '#00D4FF',
  },

  status: {
    ideia: {
      color: '#00D4FF',
      bg: '#00D4FF15',
      border: '#00D4FF35',
      label: 'Ideia',
      emoji: '💡',
      gradient: ['#00D4FF', '#0099BB'],
    },
    em_progresso: {
      color: '#FFB547',
      bg: '#FFB54715',
      border: '#FFB54735',
      label: 'Em Progresso',
      emoji: '🚀',
      gradient: ['#FFB547', '#CC8800'],
    },
    concluido: {
      color: '#00E5A0',
      bg: '#00E5A015',
      border: '#00E5A035',
      label: 'Concluído',
      emoji: '✅',
      gradient: ['#00E5A0', '#009966'],
    },
    pausado: {
      color: '#9090B8',
      bg: '#9090B815',
      border: '#9090B835',
      label: 'Pausado',
      emoji: '⏸️',
      gradient: ['#9090B8', '#606090'],
    },
  },

  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  radius: { xs: 6, sm: 10, md: 14, lg: 18, xl: 24, xxl: 32, full: 999 },

  font: {
    display: 'Sora-Bold',
    semibold: 'Sora-SemiBold',
    body: 'DMSans-Regular',
    medium: 'DMSans-Medium',
    sizes: { xs: 11, sm: 13, md: 15, lg: 18, xl: 22, xxl: 28, xxxl: 36, hero: 48 },
  },

  shadow: {
    sm: {
      shadowColor: '#6C63FF',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    md: {
      shadowColor: '#6C63FF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    lg: {
      shadowColor: '#6C63FF',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 12,
    },
  },
};

export type Theme = typeof theme;
export type ProjectStatus = 'ideia' | 'em_progresso' | 'concluido' | 'pausado';
