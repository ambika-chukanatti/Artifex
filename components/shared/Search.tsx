"use client"

import { useEffect, useState } from 'react'
import { formUrlQuery, removeKeysFromQuery } from '@/lib/utils'
import { useRouter, useSearchParams } from "next/navigation"

const Search = () => {
  const [query, setQuery] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query) {
        const newUrl = formUrlQuery({
          searchParams: searchParams.toString(),
          key: "query",
          value: query,
        })
        router.push(newUrl, { scroll: false })
      } else {
        const newUrl = removeKeysFromQuery({
          searchParams: searchParams.toString(),
          keysToRemove: ["query"],
        })
        router.push(newUrl, { scroll: false })
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [router, searchParams, query])

  return (
    <div className="search-wrapper">
      <div className="search-inner">
        {/* Search icon */}
        <svg
          className="search-icon"
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search images…"
          className="search-input"
        />

        {/* Clear button */}
        {query && (
          <button className="search-clear" onClick={() => setQuery("")} aria-label="Clear search">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M1.5 1.5l8 8M9.5 1.5l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export default Search