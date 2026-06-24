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
                model: "nvidia/nemotron-3-nano-30b-a3b:free",
                messages: messages,
                temperature: 0.3,
                response_format: { type: "json_object" }
            })
        });

        const rawContent = response.data.choices[0].message.content;
        console.log("AI Raw Response:", rawContent); // ← مؤقت للتشخيص
        
        // تنظيف الـ response من backticks والنصوص الزائدة
        const cleanContent = rawContent
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();
        
        const parsed = JSON.parse(cleanContent);
        
        // تأكد من وجود جميع الحقول المطلوبة
        return {
            score: parsed.score ?? 0,
            aiEvaluation: parsed.aiEvaluation ?? {},
            strengths: parsed.strengths ?? [],
            improvements: parsed.improvements ?? []
        };
    } catch (error) {
        console.error("AI Service Error:", error.message);
        throw error;
    }
};

module.exports = {
    generateAIResponse
};