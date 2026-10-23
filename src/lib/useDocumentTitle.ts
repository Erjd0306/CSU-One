import { useEffect } from 'react'

export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title ? `${title} | CSU-One` : 'CSU-One | Campus Issue Reporting'
  }, [title])
}
