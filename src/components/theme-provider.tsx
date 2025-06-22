// Inspired by next-themes
"use client"

import * as React from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  attribute = "class",
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof window !== 'undefined') {
        try {
            return (localStorage.getItem(storageKey) as Theme) || defaultTheme
        } catch (e) {
            console.error('Error reading localStorage:', e);
            return defaultTheme
        }
    }
    return defaultTheme
  })

  React.useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")
    
    if (disableTransitionOnChange) {
      const transitions = document.createElement('style')
      transitions.innerText = `*, *::before, *::after { transition: none !important; }`
      document.head.appendChild(transitions)
      // Force repaint
      ;(() => window.getComputedStyle(document.body))()
      // Wait for next frame before removing
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.head.removeChild(transitions)
        })
      })
    }
    
    let effectiveTheme = theme;
    if (theme === "system" && enableSystem) {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        effectiveTheme = systemTheme;
    }
    
    root.classList.add(effectiveTheme)

  }, [theme, enableSystem, disableTransitionOnChange])
  
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    
    const handleChange = () => {
        if(theme === 'system' && enableSystem) {
            const systemTheme = mediaQuery.matches ? "dark" : "light"
            document.documentElement.classList.remove("light", "dark")
            document.documentElement.classList.add(systemTheme)
        }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
}, [theme, enableSystem])


  const value = {
    theme,
    setTheme: (theme: Theme) => {
      if (typeof window !== 'undefined') {
          try {
              localStorage.setItem(storageKey, theme)
          } catch(e) {
             console.error('Error writing to localStorage:', e);
          }
      }
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
