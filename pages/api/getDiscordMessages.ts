const { Client, Intents } = require("discord.js");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

import { NextApiRequest, NextApiResponse } from "next";

const uniqueKey = process.env.AUTHOR_KEY;

export default async function createAttestation(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  const { message, uid, account, domain, types, signature } = req.body;

  fetch("https://discord.com/api/v6/users/@me/guilds", {
    headers: {
      "Authorization": `Bearer ${account.access_token}`,
    },
  });

  try {
    client.once("ready", () => {
      console.log(`Logged in as ${client.user.tag}`);
    });

    client.on("messageCreate", async (message: any) => {
      if (message.channel.name === "Digital Biometrics | The State") {
        console.log(`Received message: ${message.content}`);
      }
    });

    client.login("YOUR_BOT_TOKEN");
  } catch (err) {
    res.json({
      err,
    });
  }
}
