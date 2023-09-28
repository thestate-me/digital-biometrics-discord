import { Alchemy, Network } from "alchemy-sdk";
import axios from "axios";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import { JsonRpcProvider } from "ethers";
import invariant from "tiny-invariant";
import { deflateSync } from 'zlib'

import type {
  Attestation,
  AttestationResult,
  EASChainConfig,
  EnsNamesResult,
  MyAttestationResult,
} from "./types";
import { SignedOffchainAttestation } from "@ethereum-attestation-service/eas-sdk";

export const alchemyApiKey = process.env.REACT_APP_ALCHEMY_API_KEY;

export const CUSTOM_SCHEMAS = {
  MET_IRL_SCHEMA:
    "0xc59265615401143689cbfe73046a922c975c99d97e4c248070435b1104b2dea7",
  CONFIRM_SCHEMA:
    "0xb96446c85ce538c1641a967f23ea11bbb4a390ef745fc5a9905689dbd48bac86",
};

dayjs.extend(duration);
dayjs.extend(relativeTime);

function getChainId() {
  return Number("11155111");
}

export const CHAINID = getChainId();
invariant(CHAINID, "No chain ID env found");

export const EAS_CHAIN_CONFIGS: EASChainConfig[] = [
  {
    chainId: 11155111,
    chainName: "sepolia",
    subdomain: "sepolia.",
    version: "0.26",
    contractAddress: "0xC2679fBD37d54388Ce493F1DB75320D236e1815e",
    schemaRegistryAddress: "0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0",
    etherscanURL: "https://sepolia.etherscan.io",
    contractStartBlock: 2958570,
    rpcProvider: "https://sepolia.infura.io/v3/",
  },
];

export const activeChainConfig = EAS_CHAIN_CONFIGS.find((config) =>
  config.chainId === CHAINID
);

export const baseURL = `https://${activeChainConfig!.subdomain}easscan.org`;

invariant(activeChainConfig, "No chain config found for chain ID");
export const EASContractAddress = activeChainConfig.contractAddress;

export const EASVersion = activeChainConfig.version;

export const EAS_CONFIG = {
  address: EASContractAddress,
  version: EASVersion,
  chainId: CHAINID,
};

export const timeFormatString = "MM/DD/YYYY h:mm:ss a";

export async function getAddressForENS(name: string) {
  const config = {
    apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
    network: Network.ETH_GOERLI,
  };
  const alchemy = new Alchemy(config);
  const address = await alchemy.core.resolveName(name);
  return address;
}

export async function getENSName(address: string) {
  const provider = new JsonRpcProvider(
    `https://eth-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`,
    "mainnet",
  );
  return await provider.lookupAddress(address);
}
export async function getAttestation(uid: string): Promise<Attestation | null> {
  const response = await axios.post<AttestationResult>(
    `${baseURL}/graphql`,
    {
      query:
        "query Query($where: AttestationWhereUniqueInput!) {\n  attestation(where: $where) {\n    id\n    attester\n    recipient\n    revocationTime\n    expirationTime\n    time\n    txid\n    data\n  }\n}",
      variables: {
        where: {
          id: uid,
        },
      },
    },
    {
      headers: {
        "content-type": "application/json",
      },
    },
  );
  return response.data.data.attestation;
}
export async function getAttestationsForAddress(address: string) {
  const response = await axios.post<MyAttestationResult>(
    `${baseURL}/graphql`,
    {
      query:
        "query Attestations($where: AttestationWhereInput, $orderBy: [AttestationOrderByWithRelationInput!]) {\n  attestations(where: $where, orderBy: $orderBy) {\n    attester\n    revocationTime\n    expirationTime\n    time\n    recipient\n    id\n    data\n  }\n}",

      variables: {
        where: {
          schemaId: {
            equals: CUSTOM_SCHEMAS.MET_IRL_SCHEMA,
          },
          OR: [
            {
              attester: {
                equals: address,
              },
            },
            {
              recipient: {
                equals: address,
              },
            },
          ],
        },
        orderBy: [
          {
            time: "desc",
          },
        ],
      },
    },
    {
      headers: {
        "content-type": "application/json",
      },
    },
  );
  return response.data.data.attestations;
}
export async function getConfirmationAttestationsForUIDs(refUids: string[]) {
  const response = await axios.post<MyAttestationResult>(
    `${baseURL}/graphql`,
    {
      query:
        "query Attestations($where: AttestationWhereInput, $orderBy: [AttestationOrderByWithRelationInput!]) {\n  attestations(where: $where, orderBy: $orderBy) {\n    attester\n    revocationTime\n    expirationTime\n    time\n    recipient\n    id\n    data\n  refUID\n  }\n}",

      variables: {
        where: {
          schemaId: {
            equals: CUSTOM_SCHEMAS.CONFIRM_SCHEMA,
          },
          refUID: {
            in: refUids,
          },
        },
        orderBy: [
          {
            time: "desc",
          },
        ],
      },
    },
    {
      headers: {
        "content-type": "application/json",
      },
    },
  );
  return response.data.data.attestations;
}
export async function getENSNames(addresses: string[]) {
  const response = await axios.post<EnsNamesResult>(
    `${baseURL}/graphql`,
    {
      query:
        "query Query($where: EnsNameWhereInput) {\n  ensNames(where: $where) {\n    id\n    name\n  }\n}",
      variables: {
        where: {
          id: {
            in: addresses,
            mode: "insensitive",
          },
        },
      },
    },
    {
      headers: {
        "content-type": "application/json",
      },
    },
  );
  return response.data.data.ensNames;
}

export function getQualitiesTypes(inputText: string) {
  const results = [];

  const emotionalIntelligenceMatch = inputText.match(
    /Emotional Intelligence: (\d+)\/\d+\n([\s\S]+?)(?=\n\n|\n$)/,
  );
  const creativityMatch = inputText.match(
    /Creativity: (\d+)\/\d+\n([\s\S]+?)(?=\n\n|\n$)/,
  );
  const communicationInitiativeMatch = inputText.match(
    /Communication and Initiative: (\d+)\/\d+\n([\s\S]+?)(?=\n\n|\n$)/,
  );
  const leadershipQualitiesMatch = inputText.match(
    /Leadership Qualities: (\d+)\/\d+\n([\s\S]+?)(?=\n\n|\n$|$)/,
  );

  if (emotionalIntelligenceMatch) {
    const emotionalIntelligence = {
      type: "Emotional Intelligence",
      score: parseInt(emotionalIntelligenceMatch[1], 10),
      description: emotionalIntelligenceMatch[2].trim(),
    };
    results.push(emotionalIntelligence);
  }

  if (creativityMatch) {
    const creativity = {
      type: "Creativity",
      score: parseInt(creativityMatch[1], 10),
      description: creativityMatch[2].trim(),
    };
    results.push(creativity);
  }

  if (communicationInitiativeMatch) {
    const communicationInitiative = {
      type: "Communication and Initiative",
      score: parseInt(communicationInitiativeMatch[1], 10),
      description: communicationInitiativeMatch[2].trim(),
    };
    results.push(communicationInitiative);
  }

  if (leadershipQualitiesMatch) {
    const leadershipQualities = {
      type: "Leadership Qualities",
      score: parseInt(leadershipQualitiesMatch[1], 10),
      description: leadershipQualitiesMatch[2].trim(),
    };
    results.push(leadershipQualities);
  }

  return results;
}

export function generateLink(attester: string, { uid, message, domain, signature }: SignedOffchainAttestation): string {
  const t = []

  t.push(domain.version)
  t.push(domain.chainId)
  t.push(domain.verifyingContract)
  t.push(signature.r)
  t.push(signature.s)
  t.push(signature.v)
  t.push(attester)
  t.push(uid)
  t.push(message.schema)
  t.push(message.recipient)
  t.push(message.time)
  t.push(message.expirationTime || 0)
  t.push(message.refUID)
  t.push(message.revocable || false)
  t.push(message.data)
  t.push(message.nonce || 0)
  t.push(message.version)

  const b64 = encodeURIComponent(deflateSync(JSON.stringify(t)).toString('base64'))

  return `https://sepolia.easscan.org/offchain/url/#attestation=${b64}`
}