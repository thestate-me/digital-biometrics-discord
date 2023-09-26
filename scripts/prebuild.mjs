import ora from 'ora'
import { writeComposite } from './composites.mjs'

const spinner = ora()

const bootstrap = async () => {
  try {
    spinner.info('[Composites] bootstrapping composites...')
    await writeComposite(spinner)

    spinner.succeed('Composites] composites bootstrapped')
  } catch (err) {
    spinner.fail(err.message)
    throw err
  }
}

bootstrap()
