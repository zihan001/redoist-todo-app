import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test/utils';
import '@testing-library/jest-dom';
import { RequireAuth } from './RequireAuth';
import { me } from '../api/auth';
import * as reactQuery from '@tanstack/react-query';

// Mock the auth API
vi.mock('../api/auth', () => ({
  me: vi.fn(),
}));

// Mock the useQuery hook from React Query
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: vi.fn(() => <div data-testid="navigate-mock" />),
  };
});

describe('RequireAuth', () => {
  it('shows loading state while checking authentication', () => {
    // Mock useQuery to return loading state
    vi.mocked(reactQuery.useQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);
    
    render(<RequireAuth>Protected Content</RequireAuth>);
    
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('renders children when user is authenticated', () => {
    // Mock useQuery to return successful authentication
    vi.mocked(reactQuery.useQuery).mockReturnValue({
      data: {
        user: {
          _id: '123',
          email: 'test@example.com',
          createdAt: '2025-01-01T00:00:00.000Z',
        }
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);
    
    render(<RequireAuth>Protected Content</RequireAuth>);
    
    // No need to await since we're controlling the state directly
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    // Mock useQuery to return error state
    vi.mocked(reactQuery.useQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Unauthorized'),
    } as any);
    
    render(<RequireAuth>Protected Content</RequireAuth>);
    
    // No need to await since we're controlling the state directly
    expect(screen.getByTestId('navigate-mock')).toBeInTheDocument();
  });
});