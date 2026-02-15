import "dotenv/config";
import OpenAI from "openai";

async function testOpenAI() {
  console.log("Testing OpenAI connection with new key...");

  if (!process.env.OPENAI_API_KEY) {
    console.error(
      "Error: OPENAI_API_KEY is not defined in environment variables.",
    );
    return;
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello, confirm you are working." }],
      max_tokens: 20,
    });

    console.log("Success! OpenAI responded:");
    console.log(completion.choices[0].message.content);
  } catch (error) {
    const fs = await import("fs");
    const errorLog =
      `Error Message: ${error.message}\n` +
      `Error Stack: ${error.stack}\n` +
      (error.response ? `Response Status: ${error.response.status}\n` : "") +
      (error.response
        ? `Response Data: ${JSON.stringify(error.response.data, null, 2)}\n`
        : "");

    fs.writeFileSync("openai_error.log", errorLog);
    console.log("Error details written to openai_error.log");
  }
}

testOpenAI();
