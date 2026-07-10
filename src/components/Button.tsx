import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  to?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  icon?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  to,
  onClick,
  disabled = false,
  className = '',
  icon = false,
  loading = false,
  type = 'button',
}: ButtonProps) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

  const variants = {
    primary:
      'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30',
    secondary:
      'bg-gray-100 text-gray-800 hover:bg-gray-200 shadow-sm hover:shadow-md',
    outline:
      'border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-600',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  if (to && !loading) {
    return (
      <Link to={to} className={classes}>
        {children}
        {icon && <ArrowRight className="w-5 h-5 ml-2" />}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          {children}
          {icon && <ArrowRight className="w-5 h-5 ml-2" />}
        </>
      )}
    </button>
  );
};

export default Button;
