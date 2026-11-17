const express = require('express');
const path = require('path');
const storage = require('./server/storage');

const app = express();
const PORT = 3000;

// Enable JSON body parsing
app.use(express.json());

// Serve all static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Helper to get client IP
function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress || req.ip || '127.0.0.1';
}

// REST API Endpoints

// 1. Profiles API
app.get('/api/profiles', (req, res) => {
    try {
        const profiles = storage.getProfiles();
        res.json({ success: true, profiles });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post('/api/profiles', (req, res) => {
    try {
        const { nickname, emoji } = req.body;
        const profile = storage.getOrCreateProfile(nickname, emoji);
        res.json({ success: true, profile });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// 2. Session Management API
app.post('/api/session/start', (req, res) => {
    try {
        const { nickname, deviceId } = req.body;
        const ip = getClientIp(req);
        const userAgent = req.headers['user-agent'] || '';

        const session = storage.startSession({
            nickname: nickname || 'Champion',
            ip,
            deviceId: deviceId || 'unknown_device',
            userAgent
        });

        res.json({ success: true, session });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post('/api/session/event', (req, res) => {
    try {
        const { sessionId, event } = req.body;
        if (!sessionId || !event) {
            return res.status(400).json({ success: false, error: 'sessionId and event required' });
        }

        const recorded = storage.recordEvent(sessionId, event);
        res.json({ success: recorded });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post('/api/session/end', (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({ success: false, error: 'sessionId required' });
        }

        const ended = storage.endSession(sessionId);
        res.json({ success: ended });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// 3. User Feedback API (Likes, Unlikes, Comments)
app.post('/api/feedback', (req, res) => {
    try {
        const { sessionId, nickname, activityId, categoryId, reaction, comment } = req.body;
        const result = storage.recordFeedback({
            sessionId,
            nickname,
            activityId,
            categoryId,
            reaction,
            comment
        });

        res.json({ success: true, userReaction: result.userReaction, feedback: result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.get('/api/feedback/summary', (req, res) => {
    try {
        const nickname = req.query.nickname || null;
        const result = storage.getFeedbackSummary(nickname);
        res.json({ success: true, summary: result.summary, userVotes: result.userVotes });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// 4. Parent Analytics & Recommendations API
app.get('/api/parent/dashboard', (req, res) => {
    try {
        const nickname = req.query.nickname || null;
        const analytics = storage.getParentAnalytics(nickname);
        res.json({ success: true, analytics });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Default route to the dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Parent Dashboard Route
app.get('/parent', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'parent.html'));
});

app.listen(PORT, () => {
    console.log(`Learning Platform running locally at: http://localhost:${PORT}`);
    console.log(`Parent Dashboard available at: http://localhost:${PORT}/parent.html`);
    console.log(`Press Ctrl+C to stop.`);
});
