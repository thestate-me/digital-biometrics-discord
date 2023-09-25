import { NextApiRequest, NextApiResponse } from "next";
// import { DISCORD_SERVER_ID } from "../../consts";

export default async function checkIsInServer(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Get the Next Auth session so we can use the accessToken as part of the discord API request
  // const session = await getServerSession(req, res, authOptions) as any;
  const { session } = req.body;
  console.log(session);
  const { user } = session;

  // Read the access token from the session
  if (!session && !session?.accessToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const accessToken = session?.accessToken;

  // Make a request to the Discord API to get the servers this user is a part of
  const response = await fetch(`https://discordapp.com/api/users/@me/guilds`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // Parse the response as JSON
  const data = await response.json();
  // console.log(data);
  // Filter all the servers to find the one we want
  // Returns undefined if the user is not a member of the server
  // Returns the server object if the user is a member
  const thirdwebDiscordMembership = data?.find(
    (server: { id: string; name: string }) =>
      server.name === "Digital Biometrics | The State",
  );
  console.log(thirdwebDiscordMembership);
  console.log("accessToken", accessToken);
  // const validateToken = await fetch("https://discord.com/api/v10/users/@me", {
  //   headers: {
  //     Authorization: `Bearer ${accessToken}`,
  //   },
  // });

  // if (validateToken.ok) {
  //   console.log(
  //     "Token is valid. Proceed with fetching channel data.",
  //   );
  //   // Token is valid; proceed with fetching channel data
  // } else {
  //   const errorData = await validateToken.json();
  //   console.error("Error validating token:", errorData);
  //   // Handle token validation error
  // }
  // const JWTDecodedToken =
  const channelDataResponseChannels = await fetch(
    `https://discord.com/api/v8/guilds/${thirdwebDiscordMembership.id}/channels`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${accessToken}`,
        ContentType: "application/json",
      },
    },
  ).then((res) => res.json());
  console.log("channelDataResponseChannels", channelDataResponseChannels);
  const channelDataResponse = await fetch(
    `https://discord.com/api/v8/channels/${"1154400705612894240"}/messages?limit=10`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${"4Wc3lLxhb3gC0mOEPyOpwIfPAMkGsC"}`,
        ContentType: "application/json",
      },
    },
  ).then((res) => res.json());
  console.log("channelDataResponse", channelDataResponse);
  if (!channelDataResponse.ok) {
    const errorData = await channelDataResponse.json();
    console.error("Error fetching channel data:", errorData);
  } else {
    const channelData = await channelDataResponse.json();
    console.log("Channel Data:", channelData);
    // You can now work with the fetched channel data as needed
  }

  // Return undefined or the server object to the client.
  return res
    .status(200)
    .json({ thirdwebMembership: thirdwebDiscordMembership ?? undefined });
}
