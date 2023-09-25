import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

const scopes = [
  "identify",
  "email",
  "connections",
  "messages.read",
  "bot",
  "webhook.incoming",
  "guilds",
  "guilds.join",
  // "dm_channes.read",
  "guilds.members.read",
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
        console.log("account", account);
        // console.log("account", account);
        // console.log("profile", profile);

        token.accessToken = account.access_token;
        token.tokenType = account.token_type;
        // token.guild = account.guild;
      }
      if (profile) {
        token.profile = profile;
      }
      return token;
    },

    async session({ session, token, user }: any) {
      // console.log(token);
      console.log("token", token);

      if (session) {
        session.accessToken = token.accessToken;
        session.tokenType = token.tokenType;
        // session.discordUser = token.profile;
      }
      console.log("user", user);
      console.log("session", session);
      console.log("token", token);

      return session;
    },
  },
});
