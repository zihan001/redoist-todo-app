import { render, screen } from '@testing-library/react';
import TaskList from '../TaskList';

test('renders TaskList component', () => {
    render(<TaskList />);
    const linkElement = screen.getByText(/task list/i);
    expect(linkElement).toBeInTheDocument();
});