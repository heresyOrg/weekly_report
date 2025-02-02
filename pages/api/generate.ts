import { OpenAIStream, OpenAIStreamPayload } from "../../utils/OpenAIStream";
import { loadConfig } from "../../utils/ConfigUtil";

if (process.env.NEXT_PUBLIC_USE_USER_KEY !== "true") {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing env var from OpenAI");
  }
}

export const config = {
  runtime: "edge",
};

const handler = async (req: Request): Promise<Response> => {
  var { prompt, api_key, tool } = (await req.json()) as {
    prompt?: string;
    api_key?: string;
    tool?: string
  };

  if (!tool) {
    throw new Error("Missing Tool")
  }
  if (!prompt) {
    return new Response("No prompt in the request", { status: 400 });
  }

  if (!process.env.OPENAI_MODEL) {
    throw new Error("Missing env var from OpenAI")
  }

  const format: string = loadConfig()['tools'][tool]['format'];
  prompt = format.replace("${content}", prompt)

  const payload: OpenAIStreamPayload = {
    model: process.env.OPENAI_MODEL,
    prompt,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 1536,
    stream: true,
    n: 1,
    api_key,
  }

  const stream = await OpenAIStream(payload);
  return new Response(stream);
};

export default handler;
