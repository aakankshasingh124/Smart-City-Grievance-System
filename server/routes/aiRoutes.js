// AI Routes: Chatbot & Text Analysis
const { handleChatbotQuery, categorizeComplaint, suggestPriority, summarizeComplaint } = require('../services/aiService');

function handleAiRoutes(req, res, parsedUrl, body) {
    const { pathname } = parsedUrl;
    const method = req.method;

    // POST /api/ai/chat
    if (pathname === '/api/ai/chat' && method === 'POST') {
        const { message, conversationHistory } = body;
        if (!message || typeof message !== 'string') {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Message text is required.' }));
        }

        const response = handleChatbotQuery(message, conversationHistory || []);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(response));
    }

    // POST /api/ai/analyze
    if (pathname === '/api/ai/analyze' && method === 'POST') {
        const { title, description } = body;
        const categoryResult = categorizeComplaint(title, description);
        const priorityResult = suggestPriority(categoryResult.category, title, description);
        const summary = summarizeComplaint(title, description);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            category: categoryResult,
            priority: priorityResult,
            summary
        }));
    }

    return false;
}

module.exports = { handleAiRoutes };
