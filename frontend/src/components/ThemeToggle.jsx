import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-16 h-8 rounded-full transition-all duration-300 border-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
      style={{
        backgroundColor: theme === 'dark' ? 'var(--surface)' : 'var(--border)',
        borderColor: theme === 'dark' ? 'var(--border)' : 'var(--text-muted)'
      }}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-label="Toggle theme"
    >
      {/* Sliding Circle */}
      <div
        className="absolute top-0.5 w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg"
        style={{
          left: theme === 'dark' ? '4px' : 'calc(100% - 28px)',
          backgroundColor: theme === 'dark' ? 'var(--text)' : 'var(--text-primary)'
        }}
      >
        {theme === 'dark' ? (
          <Moon size={14} className="text-dark-bg" />
        ) : (
          <Sun size={14} className="text-light-bg" />
        )}
      </div>
    </button>
  );
}
