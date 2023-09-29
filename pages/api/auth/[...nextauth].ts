import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

const scopes = [
  "identify",
  "email",
  // "connections",
  "messages.read",
  // "bot",
  // "webhook.incoming",
  "guilds",
  // "guilds.join",
  // "guilds.members.read",
];

export default NextAuth({
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID ?? "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
      authorization: { params: { scope: scopes.join(" ") } },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.tokenType = account.token_type;
        token.server = {};
        token.server = account.guild;
      }
      if (profile) {
        token.profile = profile;
      }
      return token;
    },

    async session({ session, token, user }: any) {
      console.log("token", token);
      if (session) {
        session.server = token.server;
        session.accessToken = token.accessToken;
        session.tokenType = token.tokenType;
      }

      return session;
    },
  },
});
