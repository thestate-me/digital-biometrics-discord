import { CeramicClient } from "@ceramicnetwork/http-client";
import { ComposeClient } from "@composedb/client";
import { RuntimeCompositeDefinition } from "@composedb/types";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { DID } from "dids";
import { JsonRpcProvider, Wallet } from "ethers";
import { Ed25519Provider } from "key-did-provider-ed25519";
import KeyResolver from "key-did-resolver";
import { NextApiRequest, NextApiResponse } from "next";
import { fromString } from "uint8arrays/from-string";
import { definition } from "../../composites/generated/definition";
import { EASContractAddress, generateLink } from "../../utils/utils";

const provider = new JsonRpcProvider(
  "https://endpoints.omniatech.io/v1/eth/sepolia/public",
);
const signer = new Wallet(process.env.AUTHOR_KEY!);

const eas = new EAS(EASContractAddress);
const schemaEncoder = new SchemaEncoder(
  "string EmotionalIntelligence,string Creativity,string CommunicationInitiative,string LeadershipQualities",
);

eas.connect(provider);

export default async function createAttestation(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  const offchain = await eas.getOffchain();
  const { address, data, channelId, userName } = req.body;

  const ei = data.find((e: any) => e.type === "Emotional Intelligence");
  const c = data.find((e: any) => e.type === "Creativity");
  const ci = data.find((e: any) => e.type === "Communication and Initiative");
  const lq = data.find((e: any) => e.type === "Leadership Qualities");

  const encodedData = schemaEncoder.encodeData([
    {
      name: "EmotionalIntelligence",
      value: `${ei.score} | ${ei.description}`,
      type: "string",
    },
    {
      name: "Creativity",
      value: `${c.score} | ${c.description}`,
      type: "string",
    },
    {
      name: "CommunicationInitiative",
      value: `${ci.score} | ${ci.description}`,
      type: "string",
    },
    {
      name: "LeadershipQualities",
      value: `${lq.score} | ${lq.description}`,
      type: "string",
    },
  ]);

  const offchainAttestation = await offchain.signOffchainAttestation({
    recipient: address,
    expirationTime: BigInt(0),
    time: BigInt(Math.floor(Date.now() / 1000)),
    revocable: false,
    version: 1,
    nonce: BigInt(0),
    schema:
      "0xb494add8fe8ee3e1aa2dd8d6f71521dd0135208fcfc474eda72c8aa6aef5959d",
    refUID:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    data: encodedData,
  }, signer);

  const ceramic = new CeramicClient(process.env.CERAMIC_NODE_URL);
  const composeClient = new ComposeClient({
    ceramic: process.env.CERAMIC_NODE_URL!,
    definition: definition as RuntimeCompositeDefinition,
  });

  const authenticateDID = async (seed: string) => {
    const key = fromString(seed, "base16");
    const provider = new Ed25519Provider(key);
    const staticDid = new DID({
      // @ts-expect-error: Ignore type error
      resolver: KeyResolver.getResolver(),
      provider,
    });
    await staticDid.authenticate();
    ceramic.did = staticDid;
    return staticDid;
  };

  try {
    const { uid, message, domain, signature, types } = offchainAttestation;

    const did = await authenticateDID(process.env.AUTHOR_KEY!);
    composeClient.setDID(did);

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
            types: ${
      JSON.stringify(types.Attest).replaceAll('"name"', "name").replaceAll(
        '"type"',
        "type",
      )
    }
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
    `);

    if (composeData.data.createAttestation.document.id) {
      await fetch(
        `https://discord.com/api/v10/channels/${channelId}/messages`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bot ${process.env.DISCORD_BOT_SECRET}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: `## Results for ${userName}
Emotional Intelligence: ${ei.score}
Creativity: ${c.score}
Communication and Initiative: ${ci.score}
Leadership Qualities: ${lq.score}

[Attestation results on blockchain ↗](${
              generateLink(signer.address, offchainAttestation)
            })
`,
          }),
        },
      );

      return res.json(composeData);
    } else {
      return res.json({
        error: "There was an error processing your write request",
      });
    }
  } catch (err) {
    console.log(err);

    res.json({
      err,
    });
  }
}
