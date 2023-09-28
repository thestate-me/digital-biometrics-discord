import { type NextApiRequest, type NextApiResponse } from "next";
import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const initPrompt = (userName: string) => {
  return `Given a chat history dataset, analyze conversation structure, identify main topics and themes, and detect instances of creativity, leadership, and emotional intelligence.

Output only the following:
1. Results for ${userName}:
   - Emotional Intelligence: [Score]/100
   [Insightful description with examples.]
   - Creativity: [Score]/100
   [Insightful description with examples.]
   - Communication and Initiative: [Score]/100
   [Insightful description with examples.]
   - Leadership Qualities: [Score]/100
   [Insightful description with examples.]

   chat history dataset:
   `;
};
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(400).json({ error: "Invalid request" });
  }

  try {
    const { text, userName } = req.body;
    console.log("req", text);
    if (!text || !userName) {
      return res.status(400).json({ error: "Invalid request" });
    }
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: initPrompt(userName) + text }],
      model: "gpt-3.5-turbo",
    });
    console.log(completion);
    console.log(completion.choices[0].message?.content);
    if (completion && completion.choices) {
      return res.status(200).json(completion.choices[0].message?.content);
    }
  } catch (error) {
    console.error("Error in openai.createChatCompletion:", error);
    return res.status(500).json({
      error: "Failed to create chat completion",
      details: error,
    });
  }
};

export default handler;
