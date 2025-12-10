import { useEffect, useRef } from "react"

/**
 * Custom hook to prevent duplicate API calls in React Strict Mode
 * This hook ensures the API call only happens once per dependency change,
 * even when React Strict Mode causes the effect to run twice in development
 */
export function useApiCallOnce(
  apiCall: () => Promise<void> | void,
  dependencies: any[] = []
) {
  const isFetchingRef = useRef(false)
  const lastDepsRef = useRef<string>("")

  useEffect(() => {
    // Create a key from dependencies
    const depsKey = JSON.stringify(dependencies)
    
    // If dependencies haven't changed and we're already fetching, skip
    if (lastDepsRef.current === depsKey && isFetchingRef.current) {
      return
    }

    // If this is a new set of dependencies, reset the fetching flag
    if (lastDepsRef.current !== depsKey) {
      isFetchingRef.current = false
      lastDepsRef.current = depsKey
    }

    // If already fetching, skip
    if (isFetchingRef.current) {
      return
    }

    // Mark as fetching
    isFetchingRef.current = true

    const result = apiCall()
    
    // If it's a promise, reset fetching flag when done
    if (result instanceof Promise) {
      result
        .then(() => {
          isFetchingRef.current = false
        })
        .catch((error) => {
          isFetchingRef.current = false
          console.error("API call failed:", error)
        })
    } else {
      isFetchingRef.current = false
    }
  }, dependencies)
}

