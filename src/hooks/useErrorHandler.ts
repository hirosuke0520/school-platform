'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

export function useErrorHandler() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get('error')
    const message = searchParams.get('message')

    if (error === 'access_denied' && message) {
      toast.error(message)
      
      // URLからパラメータを削除するためにページを更新
      const url = new URL(window.location.href)
      url.searchParams.delete('error')
      url.searchParams.delete('message')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])
}