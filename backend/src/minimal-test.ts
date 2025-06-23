// Ultra-minimal Cloudflare Worker without Hono for crash testing
export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    console.log('Minimal worker: Request received')
    
    const url = new URL(request.url)
    
    if (url.pathname === '/health') {
      console.log('Minimal worker: Health endpoint hit')
      return new Response(JSON.stringify({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        message: 'Ultra-minimal worker responding' 
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      })
    }
    
    console.log('Minimal worker: Default response')
    return new Response(JSON.stringify({ 
      message: 'Ultra-minimal Cloudflare Worker', 
      path: url.pathname 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })
  },
}
