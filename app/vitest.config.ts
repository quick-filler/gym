import { defineConfig } from 'vitest/config';

/**
 * The app is Expo/React Native, but these tests only cover pure Node-
 * compatible helpers (format, theme). React Native screens / hooks that
 * depend on lucide-react-native / expo-router would need jest with the
 * Jest-Expo preset — kept as follow-up work, not in scope here.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts', 'hooks/**/*.test.ts'],
  },
});
