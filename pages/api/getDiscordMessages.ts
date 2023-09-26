import { NextApiRequest, NextApiResponse } from 'next'
import { Client, GatewayIntentBits } from 'discord.js'

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
})

client.once('ready', () => {
  console.log(`Logged in as ${client?.user?.tag}`)
})

client.on('messageCreate', async (message: any) => {
  if (message.channel.name === 'Digital Biometrics | The State') {
    console.log(`Received message: ${message.content}`)
  }
})

export default async function testDiscord (req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await client.login(process.env.DISCORD_BOT_SECRET)

    const channel = await client.channels.fetch('1154400705612894240')

    // @ts-expect-error
    console.log(await channel.messages.fetch({ limit: 100 }))

    res.json({ ok: true })
  } catch (err) {
    console.log(err)

    res.json({
      err
    })
  }
}
