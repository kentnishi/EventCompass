import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define a type for the messages we expect. Note: OpenAI uses 'user', 'assistant', 'system'. We'll need to map our DB roles to these.
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
      model: "gpt-5-nano", // A cost-effective and fast model
      messages: messages,
    });

    const responseMessage = completion.choices[0]?.message;

    return responseMessage;

  } catch (error) {
    console.error("Error getting chat completion:", error);
    // In a real app, you might want to throw the error or handle it differently
    return null;
  }
}


export async function getChatCompletionStream(messages: ChatCompletionMessage[]) {
  if (!messages || messages.length === 0) {
    return null;
  }

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-5-nano",
      stream: true,
      messages: messages,
    });

    return stream;

  } catch (error) {
    
    console.error("Error getting chat completion:", error);
    // In a real app, you might want to throw the error or handle it differently
    return null;
  }
}
