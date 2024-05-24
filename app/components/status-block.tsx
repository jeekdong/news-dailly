import { Spinner } from '@nextui-org/react'

import type { Status } from '~/types/log'

interface Props {
  status: Status
  className?: string
}

export function StatusBlock({
  status,
  className,
}: Props) {
  if (status === 'pending') {
    return (
      <div className={`w-4 h-4 rounded-full bg-slate-600 ${className}`} />
    )
  }
  if (status === 'progress')
    return <Spinner className={`${className}`} color="primary" size="sm" />

  if (status === 'done') {
    return (
      <div className={`w-4 h-4 rounded-full bg-green-500 ${className}`} />
    )
  }
  if (status === 'fail') {
    return (
      <div className={`w-4 h-4 rounded-full bg-red-500 ${className}`} />
    )
  }
  return null
}
