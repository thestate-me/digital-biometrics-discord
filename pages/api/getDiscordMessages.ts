import { NextApiRequest, NextApiResponse } from "next";
// import client from "../../utils/discord";
import { Client, GatewayIntentBits } from "discord.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`Logged in as ${client?.user?.tag}`);
});

client.on("messageCreate", async (message: any) => {
  if (message.channel.name === "Digital Biometrics | The State") {
    console.log(`Received message: ${message.content}`);
  }
});

export default async function testDiscord(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  try {
    const { session } = req.body;
    const channelId = session.server.system_channel_id;
    console.log("channelId", channelId);
    // console.log(session);
    if (!channelId) return res.json({ ok: false, error: "No channel id" });
    client.login(process.env.DISCORD_BOT_SECRET).then(async () => {
      const channel = await client.channels.fetch(
        channelId,
      );
      // console.log(channel);
      // @ts-expect-error
      const messages = await channel.messages.fetch({ limit: 100 });
      // console.log(messages);
      if (!messages) console.log("error");
      // const messagesT = await channel.message.fetch({ limit: 100 });
      // console.log(messages.length);
      const textMessages = messages.map((m: any) => ({
        user: m.author.username,
        text: m.content,
        date: new Date(m.createdTimestamp).toLocaleString(),
      })).reverse().filter((m: any) => m.text.length > 0);

      console.log(
        textMessages.map((m: any) => `${m.user}@${m.date}: ${m.text}`)
          .join("\n"),
      );
      res.json({ ok: true, messages: textMessages });
    });
  } catch (err) {
    console.log(err);

    res.json({
      err,
    });
  }
}
