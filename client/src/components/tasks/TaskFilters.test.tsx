import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '../../test/utils';
import TaskFilters from './TaskFilters';

describe('TaskFilters', () => {
  it('renders all filter buttons', () => {
    render(<TaskFilters />);
    
    // Check that all filter buttons are displayed
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Upcoming')).toBeInTheDocument();
    expect(screen.getByText('Past')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    
    // Check that priority filters are displayed
    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Med')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('applies "today" filter when clicked', () => {
    // Provide a custom route with the initial URL params
    render(<TaskFilters />, { route: '/app/tasks' });
    
    // Get and click the Today button
    const todayButton = screen.getByText('Today');
    fireEvent.click(todayButton);
    
    // Check that the URL was updated with the filter
    expect(window.location.search).toContain('filter=today');
  });
});