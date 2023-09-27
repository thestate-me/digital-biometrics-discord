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

client.login(process.env.DISCORD_BOT_SECRET);

export default client;
