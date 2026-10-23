/**
 * Reads an image file and downsizes it to a JPEG data URL so photos fit
 * comfortably inside localStorage in prototype mode.
 */
export async function compressImage(file: File, maxSize = 1024, quality = 0.72): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file (JPG, PNG, or HEIC).')
  if (file.size > 15 * 1024 * 1024) throw new Error('The photo is larger than 15 MB. Please choose a smaller image.')

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('The photo could not be read. Please try another image.'))
    reader.readAsDataURL(file)
  })

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image()
    el.onload = () => resolve(el)
    el.onerror = () => reject(new Error('This image format is not supported by your browser.'))
    el.src = dataUrl
  })

  const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return dataUrl
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', quality)
}
