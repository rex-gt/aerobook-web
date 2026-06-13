import { vi } from 'vitest'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  
  // Mock globalThis.fetch by default to return a disabled config
  globalThis.fetch = vi.fn().mockImplementation(() => 
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ enabled: false, features: [] })
    })
  )
})

vi.spyOn(console, 'error').mockImplementation(() => {})
vi.spyOn(console, 'log').mockImplementation(() => {})
