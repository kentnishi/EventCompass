import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type ChatCompletionMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export async function getChatCompletion(messages: ChatCompletionMessage[]) {
  if (!messages || messages.length === 0) {
    return null;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages,
    });

    return completion.choices[0]?.message ?? null;
  } catch (error) {
    console.error("Error getting chat completion:", error);
    return null;
  }
}

export async function getChatCompletionStream(messages: ChatCompletionMessage[]) {
  if (!messages || messages.length === 0) {
    return null;
  }

  try {
    return await openai.chat.completions.create({
      model: "gpt-5-nano",
      stream: true,
      messages,
    });
  } catch (error) {
    console.error("Error getting chat completion:", error);
    return null;
  }
}
