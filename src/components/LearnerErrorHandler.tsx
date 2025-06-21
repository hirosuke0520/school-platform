'use client'

import { Suspense } from 'react'
import { useErrorHandler } from '@/hooks/useErrorHandler'

function LearnerErrorHandlerContent() {
  useErrorHandler()
  return null
}

export default function LearnerErrorHandler() {
  return (
    <Suspense fallback={null}>
      <LearnerErrorHandlerContent />
    </Suspense>
  )
}