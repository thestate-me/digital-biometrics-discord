import { ComposeClient } from '@composedb/client'
import { RuntimeCompositeDefinition } from '@composedb/types'
import { Wallet } from 'ethers'
import { NextApiRequest, NextApiResponse } from 'next'
import { deflateSync } from 'node:zlib'

import { definition } from '../../composites/generated/definition.js'

const signer = new Wallet(process.env.AUTHOR_KEY!)

export default async function createAttestation (
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const composeClient = new ComposeClient({
    ceramic: process.env.CERAMIC_NODE_URL!,
    definition: definition as RuntimeCompositeDefinition
  })

  try {
    const r: any = await composeClient.executeQuery(`
        query {
          attestationIndex(
            filters: {
              or: [
                { where: { attester: { equalTo: "${signer.address}" } } }
                { and: { where: { recipient: { equalTo: "${req.body.account}" } } } }
              ]
            }
            last: 1
          ) {
            edges {
              node {
                id
                uid
                schema
                attester
                verifyingContract
                easVersion
                version
                chainId
                types {
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
        }    
    `)

    const attestats = r.data.attestationIndex.edges

    const links = attestats.map((a: any) => {
      const t = []
      const attestat = a.node

      t.push(attestat.easVersion)
      t.push(attestat.chainId)
      t.push(attestat.verifyingContract)
      t.push(attestat.r)
      t.push(attestat.s)
      t.push(attestat.v)
      t.push(attestat.attester)
      t.push(attestat.uid)
      t.push(attestat.schema)
      t.push(attestat.recipient)
      t.push(attestat.time)
      t.push(attestat.expirationTime || 0)
      t.push(attestat.refUID)
      t.push(attestat.revocable || false)
      t.push(attestat.data)
      t.push(attestat.nonce || 0)
      t.push(attestat.version)

      const b64 = encodeURIComponent(deflateSync(JSON.stringify(t)).toString('base64'))

      return `https://sepolia.easscan.org/offchain/url/#attestation=${b64}`
    })

    return res.json({ link: links[0] })
  } catch (err) {
    console.log(err)
    res.json({
      err
    })
  }
}
