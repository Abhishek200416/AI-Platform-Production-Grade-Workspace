'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// Cache for API results
const apiCache = new Map()

// Debounce utility
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Retry utility with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Don't retry on 4xx errors (client errors)
      if (error.status >= 400 && error.status < 500) {
        throw error
      }
      
      // Don't retry on the last attempt
      if (i === maxRetries - 1) {
        throw error
      }
      
      // Wait with exponential backoff
      const delay = baseDelay * Math.pow(2, i)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

export function useApi(url, options = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortControllerRef = useRef(null)
  
  const {
    immediate = true,
    cache = true,
    retries = 3,
    ...fetchOptions
  } = options

  const fetchData = useCallback(async (customUrl, customOptions = {}) => {
    const finalUrl = customUrl || url
    const finalOptions = { ...fetchOptions, ...customOptions }
    
    if (!finalUrl) return

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()
    
    setLoading(true)
    setError(null)

    try {
      // Check cache first
      const cacheKey = JSON.stringify({ url: finalUrl, options: finalOptions })
      if (cache && apiCache.has(cacheKey)) {
        const cachedData = apiCache.get(cacheKey)
        // Check if cache is still valid (5 minutes)
        if (Date.now() - cachedData.timestamp < 5 * 60 * 1000) {
          setData(cachedData.data)
          setLoading(false)
          return cachedData.data
        } else {
          apiCache.delete(cacheKey)
        }
      }

      const response = await retryWithBackoff(
        async () => {
          const res = await fetch(finalUrl, {
            ...finalOptions,
            signal: abortControllerRef.current.signal,
            headers: {
              'Content-Type': 'application/json',
              ...finalOptions.headers
            }
          })
          
          if (!res.ok) {
            const error = new Error(`HTTP error! status: ${res.status}`)
            error.status = res.status
            error.response = res
            throw error
          }
          
          return res
        },
        retries
      )

      const result = await response.json()
      
      // Cache the result
      if (cache) {
        const cacheKey = JSON.stringify({ url: finalUrl, options: finalOptions })
        apiCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        })
      }
      
      setData(result)
      return result
      
    } catch (err) {
      if (err.name === 'AbortError') {
        // Request was aborted, don't update state
        return
      }
      
      console.error('API Error:', err)
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [url, cache, retries, JSON.stringify(fetchOptions)])

  const refetch = useCallback(() => {
    return fetchData()
  }, [fetchData])

  useEffect(() => {
    if (immediate && url) {
      fetchData()
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [immediate, fetchData])

  return {
    data,
    loading,
    error,
    refetch,
    fetchData
  }
}

// Specialized hook for POST requests
export function useApiMutation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutate = useCallback(async (url, options = {}) => {
    setLoading(true)
    setError(null)

    try {
      const response = await retryWithBackoff(
        async () => {
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            ...options
          })
          
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            const error = new Error(errorData.error || `HTTP error! status: ${res.status}`)
            error.status = res.status
            error.response = res
            throw error
          }
          
          return res
        }
      )

      const result = await response.json()
      return result
      
    } catch (err) {
      console.error('Mutation Error:', err)
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    mutate,
    loading,
    error
  }
}

// Debounced search hook
export function useDebouncedApi(url, searchTerm, delay = 500, options = {}) {
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm)
  const [isSearching, setIsSearching] = useState(false)
  
  const debouncedSearch = useCallback(
    debounce((term) => {
      setDebouncedTerm(term)
      setIsSearching(false)
    }, delay),
    [delay]
  )

  useEffect(() => {
    setIsSearching(true)
    debouncedSearch(searchTerm)
  }, [searchTerm, debouncedSearch])

  const searchUrl = debouncedTerm ? `${url}?q=${encodeURIComponent(debouncedTerm)}` : null
  const { data, loading, error, refetch } = useApi(searchUrl, {
    immediate: !!debouncedTerm,
    ...options
  })

  return {
    data,
    loading: loading || isSearching,
    error,
    refetch,
    searchTerm: debouncedTerm
  }
}