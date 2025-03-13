import 'dotenv/config';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { EmbedBuilder } from 'discord.js';

// AI model setup
const model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  axOutputTokens: 2048,
});

// Handle AI chat requests
export async function AiRequest(message) {
    const prompt = message.content.replace(".ai ", "");

    const promptTitle = `Please provide a short title in english for the following topic with an amoji at the start: "${prompt}"`;
    const shortAnswerPrompt = `Please provide a short answer to the following question: "${prompt}"`;

    console.log(`📩 Received request: ${prompt}`);
    try {
        const title = await model.invoke(promptTitle);
        const response = await model.invoke(shortAnswerPrompt);

        console.log(`👍 Given response: "${response.content}"`);

        const responseEmbed = new EmbedBuilder()
            .setColor(0x32CD32)
            .setTitle(title.content)
            .setDescription(response.content);

        message.reply({ embeds: [responseEmbed] });
    } catch (error) {
        console.error("Error generating response:", error);

        const errorEmbed = new EmbedBuilder()
            .setColor(0xFF6347)
            .setTitle('🚨 Oops! Something went wrong')
            .setDescription('There was an issue getting the response from the AI. Please try again later.')
            .setTimestamp();

        message.reply({ embeds: [errorEmbed] });
    }
}
