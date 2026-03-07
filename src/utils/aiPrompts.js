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
    category: type: string
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
- Score must be between 0 and 10.
- All feedback content MUST be written in Arabic.
- Technical terms may remain in English when necessary.
- Do NOT add explanations outside JSON.
- Return ONLY valid JSON.

JSON format:
{
    score: {
        type: Number,
        min: 0,
        max: 100
    },
    aiEvaluation: {
        clarity: {
            type: Number,
            min: 0,
            max: 100
        },
        confidence: {
            type: Number,
            min: 0,
            max: 100
        },
        relevance: {
            type: Number,
            min: 0,
            max: 100
        },
        organization: {
            type: Number,
            min: 0,
            max: 100
        },
        engagement: {
            type: Number,
            min: 0,
            max: 100
        }
    },
    strengths: {
        type: [String]
    },
    improvements: {
        type: [String]
    }
}
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
- Provide a realistic and fair overall score from 0 to 10.
- Determine the technical level accurately.
- All feedback content MUST be written in Arabic.
- Be constructive and professional.
- Do NOT write anything outside JSON.
- Return ONLY valid JSON.

JSON format:
{
    score: {
        type: Number,
        min: 0,
        max: 100
    },
    aiEvaluation: {
        clarity: {
            type: Number,
            min: 0,
            max: 100
        },
        confidence: {
            type: Number,
            min: 0,
            max: 100
        },
        relevance: {
            type: Number,
            min: 0,
            max: 100
        },
        organization: {
            type: Number,
            min: 0,
            max: 100
        },
        engagement: {
            type: Number,
            min: 0,
            max: 100
        }
    },
    strengths: {
        type: [String]
    },
    improvements: {
        type: [String]
    }
}
`
        },
        {
            role: "user",
            content: `
Here is the full session data:

${JSON.stringify(questionsWithAnswers, null, 2)}

Analyze the candidate performance.
`
        }
    ];
};

module.exports = {
    buildQuestionPrompt,
    buildAnswerAnalysisPrompt,
    buildSessionAnalysisPrompt
};