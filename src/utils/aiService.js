const generateAIResponse = async (messages) => {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "nvidia/nemotron-3-nano-30b-a3b:free",
                messages: messages,
                temperature: 0.3,
                response_format: { type: "json_object" } 
            })
        });
        const data = await response.json();
        if (!response.ok) {
            console.error("AI Error:", data);
            throw new Error("AI request failed");
        }
        return JSON.parse(data.choices[0].message.content);
    } catch (error) {
        console.error("AI Service Error:", error);
        throw error;
    }
};

module.exports = {
    generateAIResponse
};