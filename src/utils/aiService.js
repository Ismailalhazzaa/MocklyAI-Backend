const axios = require('axios');

const generateAIResponse = async (messages) => {
    try {
        const response = await axios({
            method: "POST",
            url: "https://openrouter.ai/api/v1/chat/completions",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                model: "nvidia/nemotron-3-ultra-550b-a55b:free",
                messages: messages,
                temperature: 0.3,
                max_tokens: 1500,
                response_format: { type: "json_object" }
            })
        });

        const rawContent = response.data.choices[0].message.content;
        const cleanContent = rawContent
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        return JSON.parse(cleanContent);
    } catch (error) {
        console.error("AI Service Error:", error.message);
        throw error;
    }
};

module.exports = { generateAIResponse };