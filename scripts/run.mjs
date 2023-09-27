import ora from 'ora'

import { spawn } from 'child_process'

const spinner = ora()

const graphiql = async () => {
  spinner.info('[GraphiQL] starting graphiql...')
  const graphiql = spawn('node', ['./scripts/graphiql.mjs'], { shell: true })

  spinner.succeed('[GraphiQL] graphiql started')

  graphiql.stdout.on('data', (buffer) => {
    console.log('[GraphiqQL]', buffer.toString())
  })
}

const next = async () => {
  spinner.info('[NextJS] starting nextjs app...')
  const next = spawn('npm', ['run', 'nextDev'], { shell: true })

  next.stdout.on('data', (buffer) => {
    console.log('[NextJS]', buffer.toString())
  })
}

const start = async () => {
  try {
    await graphiql()
    await next()
  } catch (err) {
    spinner.fail(err)
  }
}

start()
