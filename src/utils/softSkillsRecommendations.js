const recommendations = {
    clarity: "حاول التعبير عن أفكارك بشكل أكثر وضوحاً. ركّز على شرح الفكرة الرئيسية أولاً ثم دعمها بأمثلة أو تفاصيل قصيرة لتسهيل فهم إجابتك",
    confidence: "حاول التحدث بثقة أكبر أثناء الإجابة. خذ لحظة قصيرة لتنظيم أفكارك قبل الرد، وتجنب التردد المفرط أو استخدام عبارات توحي بعدم التأكد",
    relevance: "حاول التركيز بشكل أكبر على الإجابة المباشرة للسؤال المطروح. تجنب الخروج عن الموضوع وركّز على النقاط التي ترتبط بالسؤال بشكل مباشر",
    organization: "حاول تنظيم إجابتك بشكل أفضل من خلال تقسيمها إلى نقاط واضحة أو خطوات متسلسلة، فهذا يساعد على إيصال الفكرة بشكل أكثر احترافية",
    engagement: "حاول إظهار تفاعل أكبر أثناء الإجابة وإيصال أفكارك بحماس واهتمام. التواصل الإيجابي يجعل إجاباتك أكثر تأثيراً وإقناعاً"
}


function softSkillsRecommendations(Evaluation) {
    const fullRecommendations = [];
    if (Evaluation.aiEvaluation.clarity < 65) {
        fullRecommendations.push(recommendations.clarity);
    }
    if (Evaluation.aiEvaluation.confidence < 65) {
        fullRecommendations.push(recommendations.confidence)
    }
    if (Evaluation.aiEvaluation.relevance < 65) {
        fullRecommendations.push(recommendations.relevance);
    }
    if (Evaluation.aiEvaluation.organization < 60) {
        fullRecommendations.push(recommendations.organization)
    }
    if (Evaluation.aiEvaluation.engagement < 60) {
        fullRecommendations.push(recommendations.engagement)
    }
    if (fullRecommendations.length === 0) {
        fullRecommendations.push("أداؤك في هذه الجلسة كان جيداً، استمر في التدريب للحفاظ على هذا المستوى");
    }
    return fullRecommendations;
};


module.exports = {
    softSkillsRecommendations
};