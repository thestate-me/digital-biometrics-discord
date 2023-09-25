import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

const scopes = [
  "identify",
  "email",
  "connections",
  "messages.read",
  "bot",
  "webhook.incoming",
];

export default NextAuth({
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID ?? "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
      authorization: { params: { scope: scopes.join(" ") } },
    }),
  ],
});
