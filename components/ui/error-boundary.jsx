'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ErrorBoundary({ children, fallback }) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleError = (error, errorInfo) => {
      setHasError(true)
      setError({ error, errorInfo })
      console.error('Error caught by boundary:', error, errorInfo)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleError)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleError)
    }
  }, [])

  const handleRetry = () => {
    setHasError(false)
    setError(null)
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  if (hasError) {
    if (fallback) {
      return fallback(error, handleRetry)
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Something went wrong</CardTitle>
            <CardDescription>
              An unexpected error occurred. Please try refreshing the page or go back to home.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error?.error?.message && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-mono text-muted-foreground">
                  {error.error.message}
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <Button onClick={handleRetry} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" onClick={handleGoHome} className="flex-1">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return children
}

export function ErrorMessage({ error, onRetry, className }) {
  return (
    <Card className={className}>
      <CardContent className="p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-destructive" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Error</h3>
        <p className="text-muted-foreground mb-4">
          {error?.message || 'An unexpected error occurred'}
        </p>
        {onRetry && (
          <Button onClick={onRetry} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}