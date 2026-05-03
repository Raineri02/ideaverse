import '@testing-library/jest-native/extend-expect';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: jest.fn(() => ({ id: 'test-id' })),
  Stack: ({ children }: any) => children,
  Tabs: ({ children }: any) => children,
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success' },
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
}));

// Mock Supabase — full auth + db
jest.mock('./src/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select:  jest.fn().mockReturnThis(),
      insert:  jest.fn().mockReturnThis(),
      update:  jest.fn().mockReturnThis(),
      delete:  jest.fn().mockReturnThis(),
      eq:      jest.fn().mockReturnThis(),
      order:   jest.fn().mockReturnThis(),
      single:  jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
    storage: {
      from: jest.fn(() => ({
        upload:       jest.fn().mockResolvedValue({ data: { path: 'test.jpg' }, error: null }),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://example.com/test.jpg' } })),
      })),
    },
    auth: {
      getSession:            jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange:     jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      signInWithPassword:    jest.fn().mockResolvedValue({ error: null }),
      signUp:                jest.fn().mockResolvedValue({ error: null }),
      signOut:               jest.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: jest.fn().mockResolvedValue({ error: null }),
    },
  },
  uploadImage: jest.fn().mockResolvedValue('https://example.com/test.jpg'),
  decode:      jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Svg     = ({ children, ...p }: any) => React.createElement(View, { testID: 'svg', ...p }, children);
  const Circle  = (p: any) => React.createElement(View, { testID: 'circle', ...p });
  const Path    = (p: any) => React.createElement(View, { testID: 'path', ...p });
  const Defs    = ({ children }: any) => children;
  const G       = ({ children }: any) => children;
  const LinearGradient = ({ children }: any) => children;
  const RadialGradient = ({ children }: any) => children;
  const Stop = () => null;
  const Animated = { createAnimatedComponent: (C: any) => C };
  return { default: Svg, Circle, Path, Defs, G, LinearGradient, RadialGradient, Stop, Animated };
});

// Mock toast utility globally
jest.mock('./src/utils/toast', () => ({
  toast: jest.fn(),
  registerToast: jest.fn(),
}));


// Silence known RN warnings in tests
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});
