import type { ReactNode } from 'react'
import { useRef } from 'react'
// import html2canvas from '@html2canvas/html2canvas'

import { Icon } from '@iconify-icon/react'

interface Props {
  children: ReactNode
  className?: string
}

export function ImageExport({
  children,
  className,
}: Props) {
  const elRef = useRef<HTMLDivElement>(null)

  const handleExport = async () => {
    const html2canvas = await import('@html2canvas/html2canvas')
    const canvas = await html2canvas.default(elRef.current as HTMLElement)
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = 'image.png'
    a.click()
  }

  return (
    <div
      ref={elRef}
      className={`${className} relative`}
    >
      {children}
      <Icon
        icon="material-symbols:cloud-download"
        className="absolute bottom-2 right-2 text-lg cursor-pointer"
        onClick={handleExport}
      />
    </div>
  )
}
