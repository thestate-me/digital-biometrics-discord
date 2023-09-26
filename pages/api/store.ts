import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk'
import { JsonRpcProvider, Wallet } from 'ethers'
import { NextApiRequest, NextApiResponse } from 'next'
import { EASContractAddress } from '../../utils/utils'
import { ComposeClient } from '@composedb/client'
import { definition } from '../../src/__generated__/definition'
import { RuntimeCompositeDefinition } from '@composedb/types'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { DID } from 'dids'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { fromString } from 'uint8arrays/from-string'
import KeyResolver from 'key-did-resolver'

const eas = new EAS(EASContractAddress)
const schemaEncoder = new SchemaEncoder('string EmotionalIntelligence,string Creativity,string CommunicationInitiative,string LeadershipQualities')

const provider = new JsonRpcProvider('https://endpoints.omniatech.io/v1/eth/sepolia/public')
const signer = new Wallet(process.env.AUTHOR_KEY!)

// @ts-expect-error: Ignore type error
eas.connect(provider)

export default async function createAttestation (req: NextApiRequest, res: NextApiResponse<any>) {
  const offchain = await eas.getOffchain()
  const { address, data } = req.body

  const encodedData = schemaEncoder.encodeData([
    { name: 'EmotionalIntelligence', value: data.EmotionalIntelligence, type: 'string' },
    { name: 'Creativity', value: data.Creativity, type: 'string' },
    { name: 'CommunicationInitiative', value: data.CommunicationInitiative, type: 'string' },
    { name: 'LeadershipQualities', value: data.LeadershipQualities, type: 'string' }
  ])

  const offchainAttestation = await offchain.signOffchainAttestation({
    recipient: address,
    expirationTime: 0,
    time: Math.floor(Date.now() / 1000),
    revocable: false,
    version: 1,
    nonce: 0,
    schema: '0xb494add8fe8ee3e1aa2dd8d6f71521dd0135208fcfc474eda72c8aa6aef5959d',
    refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
    data: encodedData
    // @ts-expect-error: Ignore type error
  }, signer)

  const ceramic = new CeramicClient('http://localhost:7007')
  const composeClient = new ComposeClient({
    ceramic: 'http://localhost:7007',
    definition: definition as RuntimeCompositeDefinition
  })

  const authenticateDID = async (seed: string) => {
    const key = fromString(seed, 'base16')
    const provider = new Ed25519Provider(key)
    const staticDid = new DID({
      // @ts-expect-error: Ignore type error
      resolver: KeyResolver.getResolver(),
      provider
    })
    await staticDid.authenticate()
    ceramic.did = staticDid
    return staticDid
  }

  try {
    const { uid, message, domain, signature, types } = offchainAttestation

    const did = await authenticateDID(process.env.AUTHOR_KEY!)
    composeClient.setDID(did)

    const composeData: any = await composeClient.executeQuery(`
      mutation {
        createAttestation(input: {
          content: {
            uid: "${uid}"
            schema: "${message.schema}"
            attester: "${signer.address}"
            verifyingContract: "${domain.verifyingContract}"
            easVersion: "${domain.version}"
            version: ${message.version}
            chainId: ${domain.chainId}
            r: "${signature.r}"
            s: "${signature.s}"
            v: ${signature.v}
            types: ${JSON.stringify(types.Attest).replaceAll('"name"', 'name').replaceAll('"type"', 'type')}
            recipient: "${message.recipient}"
            refUID: "${message.refUID}"
            data: "${message.data}"
            time: ${message.time}
          }
        }) 
        {
          document {
            id
            uid
            schema
            attester
            verifyingContract 
            easVersion
            version 
            chainId 
            types{
              name
              type
            }
            r
            s
            v
            recipient
            refUID
            data
            time
          }
        }
      }
    `)

    if (composeData.data.createAttestation.document.id) {
      return res.json(composeData)
    } else {
      return res.json({
        error: 'There was an error processing your write request'
      })
    }
  } catch (err) {
    console.log(err)

    res.json({
      err
    })
  }
}
