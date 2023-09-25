import { ComposeClient } from "@composedb/client";
import { RuntimeCompositeDefinition } from "@composedb/types";
import { NextApiRequest, NextApiResponse } from "next";
import { Wallet } from "ethers";

import { definition } from "../../src/__generated__/definition.js";

const signer = new Wallet(process.env.AUTHOR_KEY!)

export default async function createAttestation(req: NextApiRequest, res: NextApiResponse<any>) {
  const composeClient = new ComposeClient({
    ceramic: "http://localhost:7007",
    definition: definition as RuntimeCompositeDefinition,
  });

  try {
    const data: any = await composeClient.executeQuery(`
          query {
              attestationIndex(filters: {
                or: [
          {
            where: {
              attester: { 
                    equalTo: "${signer.address}"
                  } 
            }
          },
          {
            and: {
              where: {
            recipient : {
                    equalTo: "${req.body.account}"
                  } 
              }
            }
          }
            ],
            } 
          first: 100) {
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
                    confirm(first: 1){
                      edges{
                        node{
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
                }
              }
            }
          }
      `);
    return res.json(data);
  } catch (err) {
    res.json({
      err,
    });
  }
}
