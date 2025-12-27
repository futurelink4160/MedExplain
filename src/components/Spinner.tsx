import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <Loader2
      className={`animate-spin text-blue-600 ${sizeClasses[size]} ${className}`}
      aria-label="Loading"
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
