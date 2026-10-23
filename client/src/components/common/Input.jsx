import React from 'react';

const Input = ({
  label,
  error,
  helperText,
  icon: Icon,
  type = 'text',
  id,
  name,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  const inputId = id || name || Math.random().toString(36).substring(2, 9);

  return (
    <div className="flex flex-col space-y-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-slate-300 flex items-center justify-between">
          <span>
            {label} {required && <span className="text-rose-400">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full bg-slate-950/80 text-slate-100 text-sm rounded-lg border transition-all duration-150 placeholder:text-slate-500 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            Icon ? 'pl-9 pr-3' : 'px-3'
          } py-2 ${
            error
              ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-800 focus:border-[#35D0BA] focus:ring-[#35D0BA]/20'
          } ${className}`}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-xs text-rose-400 mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-400 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Input;
