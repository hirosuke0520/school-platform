'use client'

import { Suspense } from 'react'
import { useErrorHandler } from '@/hooks/useErrorHandler'

function AdminErrorHandlerContent() {
  useErrorHandler()
  return null
}

export default function AdminErrorHandler() {
  return (
    <Suspense fallback={null}>
      <AdminErrorHandlerContent />
    </Suspense>
  )
}