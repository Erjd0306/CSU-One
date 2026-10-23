import { useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Field, describedBy } from './Form'

type FieldInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className' | 'type'> & {
  id: string
  label: string
  error?: string
  hint?: string
  /** Content placed to the right of the label, such as a small link */
  action?: ReactNode
  /** Shows the required asterisk next to the label */
  markRequired?: boolean
}

type TextFieldProps = FieldInputProps & { type?: 'text' | 'email' | 'tel' | 'search' }

/** Labelled text input with inline error/hint wiring for screen readers. */
export function TextField({ id, label, error, hint, action, markRequired, type = 'text', ...input }: TextFieldProps) {
  return (
    <Field id={id} label={label} error={error} hint={hint} action={action} required={markRequired}>
      <input
        id={id}
        type={type}
        className={`field ${error ? 'field-invalid' : ''}`}
        aria-invalid={!!error}
        aria-describedby={describedBy(id, error, hint)}
        {...input}
      />
    </Field>
  )
}

/** Password input with a show/hide toggle that keeps the same height as other fields. */
export function PasswordField({ id, label, error, hint, action, markRequired, ...input }: FieldInputProps) {
  const [visible, setVisible] = useState(false)
  return (
    <Field id={id} label={label} error={error} hint={hint} action={action} required={markRequired}>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={`field pr-12 ${error ? 'field-invalid' : ''}`}
          aria-invalid={!!error}
          aria-describedby={describedBy(id, error, hint)}
          {...input}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="focusable absolute right-0 top-0 grid h-11 w-11 place-items-center rounded-r-lg text-slate-500 transition hover:text-slate-800 active:text-slate-900"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          aria-controls={id}
        >
          {visible ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
        </button>
      </div>
    </Field>
  )
}
