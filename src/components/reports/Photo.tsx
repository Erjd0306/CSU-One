import { useRef, useState } from 'react'
import { Camera, ImageOff, ImagePlus, LoaderCircle, Trash2 } from 'lucide-react'
import { compressImage } from '../../lib/image'

type PhotoPickerProps = {
  id: string
  value?: string
  onChange: (dataUrl: string | undefined) => void
  label?: string
}

/** Upload from the device or capture with the camera, with a preview and remove action. */
export function PhotoPicker({ id, value, onChange, label = 'Photo of the problem' }: PhotoPickerProps) {
  const uploadRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handle = async (file?: File) => {
    if (!file) return
    setError('')
    setBusy(true)
    try {
      onChange(await compressImage(file))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The photo could not be added.')
    } finally {
      setBusy(false)
      if (uploadRef.current) uploadRef.current.value = ''
      if (cameraRef.current) cameraRef.current.value = ''
    }
  }

  return (
    <div>
      <p id={`${id}-label`} className="label">{label}</p>
      {value ? (
        <figure className="overflow-hidden rounded-lg border bg-slate-50">
          <img src={value} alt="Preview of the selected photo" className="max-h-72 w-full object-contain" />
          <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t bg-white px-3 py-2">
            <span className="text-xs text-slate-500">Photo attached</span>
            <span className="flex gap-1">
              <button type="button" className="btn-ghost btn-sm" onClick={() => uploadRef.current?.click()}>Replace</button>
              <button type="button" className="btn-ghost btn-sm text-rose-700 hover:bg-rose-50 hover:text-rose-800" onClick={() => onChange(undefined)}>
                <Trash2 size={14} aria-hidden />Remove
              </button>
            </span>
          </figcaption>
        </figure>
      ) : (
        <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby={`${id}-label`}>
          <button type="button" disabled={busy} onClick={() => cameraRef.current?.click()} className="focusable flex min-h-24 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 active:bg-brand-100 disabled:opacity-50">
            {busy ? <LoaderCircle size={20} className="animate-spin" aria-hidden /> : <Camera size={20} aria-hidden />}
            <span className="text-xs font-semibold">Take a photo</span>
          </button>
          <button type="button" disabled={busy} onClick={() => uploadRef.current?.click()} className="focusable flex min-h-24 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 active:bg-brand-100 disabled:opacity-50">
            <ImagePlus size={20} aria-hidden />
            <span className="text-xs font-semibold">Upload from device</span>
          </button>
        </div>
      )}
      <input ref={uploadRef} id={id} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => handle(e.target.files?.[0])} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => handle(e.target.files?.[0])} />
      {error ? <p className="error-text" role="alert">{error}</p> : <p className="hint">JPG or PNG. Photos are resized to save space.</p>}
    </div>
  )
}

export function PhotoEvidence({ src, alt, emptyLabel = 'No photo was attached' }: { src?: string; alt: string; emptyLabel?: string }) {
  if (!src) {
    return (
      <div className="flex h-32 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed bg-slate-50 text-slate-500">
        <ImageOff size={20} aria-hidden />
        <span className="text-xs">{emptyLabel}</span>
      </div>
    )
  }
  return (
    <figure className="overflow-hidden rounded-lg border bg-slate-50">
      <img src={src} alt={alt} className="max-h-72 w-full object-contain" />
    </figure>
  )
}
