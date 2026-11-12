import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'outline' | 'ghost';
}

export function Button({
  children, size = 'md', fullWidth, loading, variant = 'primary',
  className = '', disabled, ...props
}: ButtonProps) {
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-5 py-2.5 text-sm', lg: 'px-8 py-3.5 text-base' };
  const base = `inline-flex items-center justify-center gap-2 font-bold rounded-xl
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${fullWidth ? 'w-full' : ''}`;

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={`${base} ${className}`}
      disabled={disabled || loading}
      {...(props as object)}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </motion.button>
  );
}
