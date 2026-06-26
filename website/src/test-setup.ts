import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// next/navigation has no app-router context under jsdom, so component/page
// smoke tests that use useRouter / useSearchParams (e.g. the Topbar's
// NotificationBell) would throw "expected app router to be mounted".
// Provide inert stubs.
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));
