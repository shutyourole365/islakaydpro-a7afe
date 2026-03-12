import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotFound from '../components/ui/NotFound';

describe('NotFound', () => {
  it('should render 404 heading', () => {
    render(<NotFound />);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('should render "Page not found" message', () => {
    render(<NotFound />);
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });

  it('should render Go Home button', () => {
    render(<NotFound />);
    expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
  });

  it('should render Browse Equipment button', () => {
    render(<NotFound />);
    expect(screen.getByRole('button', { name: /browse equipment/i })).toBeInTheDocument();
  });

  it('should render Go Back button', () => {
    render(<NotFound />);
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
  });

  it('should call onNavigate("home") when Go Home is clicked', async () => {
    const user = userEvent.setup();
    const mockNavigate = vi.fn();
    render(<NotFound onNavigate={mockNavigate} />);
    await user.click(screen.getByRole('button', { name: /go home/i }));
    expect(mockNavigate).toHaveBeenCalledWith('home');
  });

  it('should call onNavigate("browse") when Browse Equipment is clicked', async () => {
    const user = userEvent.setup();
    const mockNavigate = vi.fn();
    render(<NotFound onNavigate={mockNavigate} />);
    await user.click(screen.getByRole('button', { name: /browse equipment/i }));
    expect(mockNavigate).toHaveBeenCalledWith('browse');
  });

  it('should render without crashing when no onNavigate prop is provided', () => {
    expect(() => render(<NotFound />)).not.toThrow();
  });
});
