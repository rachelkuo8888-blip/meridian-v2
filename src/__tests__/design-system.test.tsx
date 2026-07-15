import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heading, Text } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';

describe('Design System — Button', () => {
  it('renders with default variant and size', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('applies loading state', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('renders gold variant', () => {
    render(<Button variant="gold">Gold</Button>);
    const button = screen.getByRole('button', { name: /gold/i });
    expect(button).toHaveClass('bg-meridian-gold');
  });

  it('renders full width', () => {
    render(<Button fullWidth>Full</Button>);
    const button = screen.getByRole('button', { name: /full/i });
    expect(button).toHaveClass('w-full');
  });
});

describe('Design System — Card', () => {
  it('renders with default variant', () => {
    render(
      <Card>
        <CardTitle>Test Title</CardTitle>
        <CardContent>Content</CardContent>
      </Card>,
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders navy variant', () => {
    render(<Card variant="navy">Navy Card</Card>);
    const card = screen.getByText('Navy Card');
    expect(card).toHaveClass('bg-deep-navy');
  });
});

describe('Design System — Badge', () => {
  it('renders with default variant', () => {
    render(<Badge>Tag</Badge>);
    expect(screen.getByText('Tag')).toBeInTheDocument();
  });

  it('renders gold variant', () => {
    render(<Badge variant="gold">Premium</Badge>);
    const badge = screen.getByText('Premium');
    expect(badge).toHaveClass('text-meridian-gold');
  });
});

describe('Design System — Typography', () => {
  it('renders heading with default serif', () => {
    render(<Heading>Heading Text</Heading>);
    const heading = screen.getByText('Heading Text');
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H2');
  });

  it('renders h1 heading', () => {
    render(<Heading as="h1">Big Title</Heading>);
    const heading = screen.getByText('Big Title');
    expect(heading.tagName).toBe('H1');
  });

  it('renders text with muted style', () => {
    render(<Text muted>Muted text</Text>);
    const text = screen.getByText('Muted text');
    expect(text).toHaveClass('text-meridian-dust');
  });
});

describe('Design System — Separator', () => {
  it('renders horizontal separator', () => {
    const { container } = render(<Separator />);
    const hr = container.querySelector('hr');
    expect(hr).toBeInTheDocument();
  });

  it('renders gold variant', () => {
    const { container } = render(<Separator variant="gold" />);
    const hr = container.querySelector('hr');
    expect(hr).toHaveClass('border-meridian-gold/40');
  });
});

describe('Design System — Spinner', () => {
  it('renders with accessible label', () => {
    render(<Spinner />);
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });

  it('renders gold variant', () => {
    const { container } = render(<Spinner variant="gold" />);
    const spinner = container.firstChild;
    expect(spinner).toHaveClass('border-t-meridian-gold');
  });
});
