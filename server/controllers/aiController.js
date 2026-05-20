const { Groq } = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.processChat = async (message) => {
    const systemPrompt = `
You are an AI for a manufacturing dashboard. Extract order details from user text.
Return ONLY a valid JSON object. No extra text.
Format:
{
  "item": "string",
  "quantity": number,
  "deadline": "YYYY-MM-DD",
  "intent": "CREATE"
}
`;

    const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: message }],
        model: "llama3-8b-8192", // Fast and efficient for tokens
        response_format: { type: "json_object" }
    });

    return JSON.parse(chatCompletion.choices[0].message.content);
};