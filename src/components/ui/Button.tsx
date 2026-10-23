import type { ButtonHTMLAttributes } from 'react'
import { LoaderCircle, type LucideIcon } from 'lucide-react'

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean
  /** Text shown next to the spinner while loading */
  loadingText?: string
  icon?: LucideIcon
  trailingIcon?: LucideIcon
  fullWidth?: boolean
}

/** The crimson primary action. Shows a spinner and blocks repeat presses while loading. */
export function PrimaryButton({
  loading = false, loadingText, icon: Icon, trailingIcon: Trailing, fullWidth = false, className = '', disabled, type = 'button', children, ...rest
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      className={`btn-primary ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <>
          <LoaderCircle size={17} className="animate-spin" aria-hidden />
          {loadingText ?? children}
        </>
      ) : (
        <>
          {Icon && <Icon size={17} aria-hidden />}
          {children}
          {Trailing && <Trailing size={17} aria-hidden />}
        </>
      )}
    </button>
  )
}
