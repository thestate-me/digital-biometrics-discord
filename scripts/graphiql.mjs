import { serveEncodedDefinition } from '@composedb/devtools-node'

/**
 * Runs GraphiQL server to view & query composites.
 */
const server = await serveEncodedDefinition({
  ceramicURL: process.env.CERAMIC_NODE_URL,
  graphiql: true,
  path: './composites/generated/definition.json',
  port: 5001
})

console.log(`Server started on ${server.port} port`)

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server stopped')
  })
})
