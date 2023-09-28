import { NextApiRequest, NextApiResponse } from "next";

export default async function testDiscord(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  try {
    // const data = await fetch('https://discord.com/api/v10/channels/1154400705612894240/messages', {
    //   headers: {
    //     "Authorization": `Bot ${process.env.DISCORD_BOT_SECRET}`,
    //     // 'User-Agent': 'DiscordBot (https://thestate-reputation.vercel.app/, 1.0.0)'
    //   }
    // })

    // const messages = await data.json()

    await fetch(
      `https://discord.com/api/v10/channels/1154400705612894240/messages`,
      {
        method: 'POST',
        headers: {
          "Authorization": `Bot ${process.env.DISCORD_BOT_SECRET}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: `test
test`
        })
      },
    )
    
    res.json({ ok: true });
  } catch (err) {
    console.log(err);

    res.json({
      err,
    });
  }
}
