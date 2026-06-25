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
                model: "meta-llama/llama-3.3-70b-instruct:free",
                messages: messages,
                temperature: 0.3,
                max_tokens: 1000,
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

module.exports = {
    generateAIResponse
};