import { screen } from '@testing-library/react';
import { renderWithProviders } from './testUtils';
import NotFoundPage from '../pages/NotFoundPage';

describe('NotFoundPage', () => {
  test('renders the attempted path and the Dashboard link', () => {
    // renderWithProviders puts the component inside MemoryRouter at the given route.
    renderWithProviders(<NotFoundPage />, { route: '/nope' });

    // Shows the attempted path in the message.
    expect(screen.getByText(/\/nope/)).toBeInTheDocument();

    // Shows a "Go to Dashboard" link pointing to /dashboard.
    const dashLink = screen.getByRole('link', { name: 'Go to Dashboard' });
    expect(dashLink).toBeInTheDocument();
    expect(dashLink.getAttribute('href')).toBe('/dashboard');

    // Shows a "Go back" button.
    expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument();
  });
});

