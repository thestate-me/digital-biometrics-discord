import { readFileSync } from 'fs'
import { CeramicClient } from '@ceramicnetwork/http-client'
import {
  createComposite,
  readEncodedComposite,
  writeEncodedComposite,
  writeEncodedCompositeRuntime
} from '@composedb/devtools-node'
import { Composite } from '@composedb/devtools'
import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { getResolver } from 'key-did-resolver'
import { fromString } from 'uint8arrays/from-string'
import ora from 'ora'

const spinner = ora()

const ceramic = new CeramicClient(process.env.CERAMIC_NODE_URL)

/**
 * @return {Promise<void>} - return void when composite finishes deploying.
 */
export const writeComposite = async () => {
  await authenticate()

  spinner.info('writing composite to Ceramic...')
  const attestationComposite = await createComposite(
    ceramic,
    './composites/00-attestation.graphql'
  )

  const composite = Composite.from([
    attestationComposite
  ])

  await writeEncodedComposite(composite, './composites/generated/definition.json')

  spinner.info('creating composite for runtime usage...')
  await writeEncodedCompositeRuntime(
    ceramic,
    './composites/generated/definition.json',
    './composites/generated/definition.js'
  )

  spinner.info('deploying composite...')
  const deployComposite = await readEncodedComposite(
    ceramic,
    './composites/generated/definition.json'
  )

  await deployComposite.startIndexingOn(ceramic)
  spinner.succeed('composite deployed & ready for use')
}

/**
 * Authenticating DID for publishing composite
 * @return {Promise<void>} - return void when DID is authenticated.
 */
const authenticate = async () => {
  const seed = readFileSync('./admin_seed.txt')
  const key = fromString(seed, 'base16')
  const did = new DID({
    resolver: getResolver(),
    provider: new Ed25519Provider(key)
  })
  await did.authenticate()
  ceramic.did = did
}

spinner.info('[Composites] bootstrapping composites...')
writeComposite().then(() => spinner.succeed('Composites] composites bootstrapped'))
