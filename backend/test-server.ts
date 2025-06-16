import { serve } from '@hono/node-server'
import app from './src/index'

// Mock Cloudflare environment for local testing
const mockEnv = {
  DB: {
    prepare: (query: string) => ({
      bind: (...params: any[]) => ({
        first: async () => null,
        all: async () => ({ results: [] }),
        run: async () => ({ meta: { last_row_id: 1 } })
      })
    })
  },
  JWT_SECRET: 'test-secret-key',
  ENVIRONMENT: 'development'
}

// Override the app context for local testing
const testApp = app.env(mockEnv)

const port = 3001
console.log(`Server is running on port ${port}`)

serve({
  fetch: testApp.fetch,
  port
})

