import { ComposeClient } from '@composedb/client'
import { RuntimeCompositeDefinition } from '@composedb/types'
import { Wallet } from 'ethers'
import { NextApiRequest, NextApiResponse } from 'next'
import { generateLink } from "../../utils/utils";

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

    const links = attestats.map(({node: {attester, uid, schema, verifyingContract, easVersion, version, chainId, r, s, v, recipient, refUID, data, time}}: any) => {
      return generateLink(attester, {
        uid,
        // @ts-expect-error
        message: {
          schema,
          version,
          recipient,
          refUID,
          data,
          time
        },
        // @ts-expect-error
        domain: {
          verifyingContract,
          version: easVersion,
          chainId
        },
        signature: {
          r,
          s,
          v
        }
      })
    })

    return res.json({ link: links[0] })
  } catch (err) {
    console.log(err)
    res.json({
      err
    })
  }
}
