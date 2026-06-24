const buildQuestionPrompt = (specialization, difficulty, previousQuestions) => {
    return [
        {
            role: "system",
            content: `
You are a professional technical interviewer.

Rules:
- Generate ONE interview question only.
- The question MUST be written in Arabic.
- Technical terms may remain in English.
- Do NOT repeat previous concepts.
- Also generate a canonical version of the question.
- The category field must be one form this array : ["general", "behavioral", "technical"].
- You MUST rotate between all three categories to ensure variety.
- General refers to personal questions about the person and their past experiences.
- Behavioral questions refer to those related to dealing with problems and the most appropriate ways to solve them.
- Technical this refers to questions related to the field of specialization.
- Do not generate any non-arabic words or chars.

Canonical rules:
- Must represent the core concept only.
- Must be short.
- Must be written in English.
- No punctuation.
- Lowercase only.
- 3 to 8 words maximum.

Return ONLY valid JSON in this format:
{
  "questionText": "string",
  "canonicalText": "string",
    category: "string"
}
`
        },
        {
            role: "user",
            content: `
Specialization: ${specialization}
Difficulty: ${difficulty}

Previous Canonical Questions:
${previousQuestions.length > 0 ? previousQuestions.join("\n") : "None"}

Generate a new unique question and its canonical form.
`
        }
    ];
};

const buildAnswerAnalysisPrompt = (question, answer) => {
    return [
        {
            role: "system",
            content: `
You are a professional technical interviewer analyzing a candidate answer.

Rules:
- Be objective and strict.
- All scores MUST be plain numbers between 0 and 100. NOT objects. NOT strings.
- All feedback content MUST be written in Arabic.
- Technical terms may remain in English when necessary.
- Do NOT write anything outside JSON.
- Return ONLY valid JSON with no extra text, no markdown, no backticks.

Return ONLY this exact JSON structure with real values like this:
{
    "score": 75,
    "aiEvaluation": {
        "clarity": 80,
        "confidence": 70,
        "relevance": 75,
        "organization": 65,
        "engagement": 72
    },
    "strengths": ["نقطة قوة أولى", "نقطة قوة ثانية"],
    "improvements": ["مجال تحسين أول", "مجال تحسين ثانٍ"]
}
Do NOT miss any values and DO NOT return empty vlaues
If the candidate answer is written in Arabic, analyze it in Arabic.
If it is mixed Arabic and English, understand both correctly.
`
        },
        {
            role: "user",
            content: `
Question:
${question}

Candidate Answer:
${answer}
`
        }
    ];
};

const buildSessionAnalysisPrompt = (questionsWithAnswers) => {
    return [
        {
            role: "system",
            content: `
You are a senior technical interviewer analyzing a full mock interview session.

Rules:
- Evaluate the overall technical performance.
- All scores MUST be plain numbers between 0 and 100. NOT objects. NOT strings.
- All feedback content MUST be written in Arabic.
- Technical terms may remain in English when necessary.
- Do NOT write anything outside JSON.
- Return ONLY valid JSON with no extra text, no markdown, no backticks.

Return ONLY this exact JSON structure with real values:
{
    "score": 75,
    "aiEvaluation": {
        "clarity": 80,
        "confidence": 70,
        "relevance": 75,
        "organization": 65,
        "engagement": 72
    },
    "strengths": ["نقطة قوة أولى", "نقطة قوة ثانية"],
    "improvements": ["مجال تحسين أول", "مجال تحسين ثانٍ"]
}
`
        },
        {
            role: "user",
            content: `
Here is the full session data:
${JSON.stringify(questionsWithAnswers, null, 2)}
Analyze the candidate performance and return the JSON.
`
        }
    ];
};

module.exports = {
    buildQuestionPrompt,
    buildAnswerAnalysisPrompt,
    buildSessionAnalysisPrompt
};