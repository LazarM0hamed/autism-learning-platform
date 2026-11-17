// Lightweight, Local, Privacy-Conscious Data Storage for Autism Learning Platform
// Handles profiles, sessions, trial events, feedback, and adaptive recommendations.
// Stored as local JSON files without external databases.

const fs = require('fs');
const path = require('path');

const STORAGE_DIR = path.join(__dirname, '..', 'storage');
const PROFILES_FILE = path.join(STORAGE_DIR, 'profiles.json');
const SESSIONS_FILE = path.join(STORAGE_DIR, 'sessions.json');
const FEEDBACK_FILE = path.join(STORAGE_DIR, 'feedback.json');

// Ensure storage directory and files exist
function ensureStorage() {
    if (!fs.existsSync(STORAGE_DIR)) {
        fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
    if (!fs.existsSync(PROFILES_FILE)) {
        fs.writeFileSync(PROFILES_FILE, JSON.stringify({ profiles: [] }, null, 2));
    }
    if (!fs.existsSync(SESSIONS_FILE)) {
        fs.writeFileSync(SESSIONS_FILE, JSON.stringify({ sessions: [] }, null, 2));
    }
    if (!fs.existsSync(FEEDBACK_FILE)) {
        fs.writeFileSync(FEEDBACK_FILE, JSON.stringify({ feedback: [] }, null, 2));
    }
}

// Helpers for read/write
function readJson(file) {
    try {
        const raw = fs.readFileSync(file, 'utf8');
        return JSON.parse(raw);
    } catch (e) {
        console.error(`Error reading ${file}:`, e);
        return {};
    }
}

function writeJson(file, data) {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.error(`Error writing ${file}:`, e);
    }
}

// Profile Management
function getProfiles() {
    ensureStorage();
    const data = readJson(PROFILES_FILE);
    return data.profiles || [];
}

function getOrCreateProfile(nickname, emoji = '🌟') {
    ensureStorage();
    const trimmed = (nickname || 'Champion').trim();
    const data = readJson(PROFILES_FILE);
    let profile = (data.profiles || []).find(p => p.nickname.toLowerCase() === trimmed.toLowerCase());

    if (!profile) {
        profile = {
            id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            nickname: trimmed,
            emoji: emoji || '🌟',
            createdAt: new Date().toISOString(),
            lastActiveAt: new Date().toISOString()
        };
        data.profiles = data.profiles || [];
        data.profiles.push(profile);
        writeJson(PROFILES_FILE, data);
    } else {
        profile.lastActiveAt = new Date().toISOString();
        if (emoji && emoji !== '🌟') profile.emoji = emoji;
        writeJson(PROFILES_FILE, data);
    }
    return profile;
}

// Session Management
function startSession({ nickname, ip, deviceId, userAgent }) {
    ensureStorage();
    const profile = getOrCreateProfile(nickname);
    const sessionData = readJson(SESSIONS_FILE);
    sessionData.sessions = sessionData.sessions || [];

    const session = {
        id: 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        profileId: profile.id,
        nickname: profile.nickname,
        ip: ip || '127.0.0.1',
        deviceId: deviceId || 'unknown_device',
        startedAt: new Date().toISOString(),
        endedAt: null,
        activeActivity: null,
        events: []
    };

    sessionData.sessions.push(session);
    writeJson(SESSIONS_FILE, sessionData);
    return session;
}

function recordEvent(sessionId, event) {
    ensureStorage();
    const sessionData = readJson(SESSIONS_FILE);
    const session = (sessionData.sessions || []).find(s => s.id === sessionId);

    if (session) {
        session.events = session.events || [];
        session.events.push({
            ...event,
            timestamp: event.timestamp || new Date().toISOString()
        });
        writeJson(SESSIONS_FILE, sessionData);
        return true;
    }
    return false;
}

function endSession(sessionId) {
    ensureStorage();
    const sessionData = readJson(SESSIONS_FILE);
    const session = (sessionData.sessions || []).find(s => s.id === sessionId);

    if (session) {
        session.endedAt = new Date().toISOString();
        writeJson(SESSIONS_FILE, sessionData);
        return true;
    }
    return false;
}

// Feedback Management (Likes, Dislikes, Parent/Therapist Comments)
// Enforces 1 vote (like / unlike) per user per activity with toggle support.
function recordFeedback({ sessionId, nickname, activityId, categoryId, reaction, comment }) {
    ensureStorage();
    const feedbackData = readJson(FEEDBACK_FILE);
    feedbackData.feedback = feedbackData.feedback || [];

    const cleanNick = (nickname || 'Champion').trim();
    const cleanAct = activityId || 'general';
    const cleanCat = categoryId || 'all';
    const cleanComment = (comment || '').trim();

    // 1. If this is a comment/observation note, record it as a distinct note entry
    let noteItem = null;
    if (cleanComment) {
        noteItem = {
            id: 'note_' + Date.now(),
            sessionId: sessionId || null,
            nickname: cleanNick,
            activityId: cleanAct,
            categoryId: cleanCat,
            reaction: reaction || 'neutral',
            comment: cleanComment,
            createdAt: new Date().toISOString()
        };
        feedbackData.feedback.push(noteItem);
    }

    // 2. Handle reaction vote (like / unlike) - strictly 1 vote per user per activity
    let finalUserReaction = null;
    if (reaction && reaction !== 'neutral') {
        const matches = feedbackData.feedback.filter(f => 
            f.nickname.toLowerCase() === cleanNick.toLowerCase() &&
            f.activityId === cleanAct &&
            !f.comment
        );

        const currentVote = matches.length > 0 ? matches[matches.length - 1].reaction : null;

        // Clean out any existing vote records for this user and activity
        feedbackData.feedback = feedbackData.feedback.filter(f => 
            !(f.nickname.toLowerCase() === cleanNick.toLowerCase() &&
              f.activityId === cleanAct &&
              !f.comment)
        );

        if (currentVote === reaction) {
            // Toggled off!
            finalUserReaction = null;
        } else {
            // New or switched vote!
            feedbackData.feedback.push({
                id: 'vote_' + Date.now(),
                sessionId: sessionId || null,
                nickname: cleanNick,
                activityId: cleanAct,
                categoryId: cleanCat,
                reaction: reaction,
                comment: '',
                createdAt: new Date().toISOString()
            });
            finalUserReaction = reaction;
        }
    }

    writeJson(FEEDBACK_FILE, feedbackData);
    return {
        success: true,
        userReaction: finalUserReaction,
        note: noteItem
    };
}

function getFeedbackSummary(userNickname = null) {
    ensureStorage();
    const feedbackData = readJson(FEEDBACK_FILE);
    const items = feedbackData.feedback || [];

    const summary = {};
    const userVotes = {};
    const cleanUser = (userNickname || '').trim().toLowerCase();
    const activeVotes = {};

    items.forEach(item => {
        const actId = item.activityId || 'general';
        if (!summary[actId]) {
            summary[actId] = { likes: 0, dislikes: 0, comments: [] };
        }

        if (item.comment) {
            summary[actId].comments.push({
                nickname: item.nickname,
                comment: item.comment,
                createdAt: item.createdAt
            });
        }

        if (item.reaction === 'like' || item.reaction === 'unlike') {
            const voteKey = `${actId}___${item.nickname.toLowerCase()}`;
            activeVotes[voteKey] = item.reaction;
        }
    });

    // Count unique user votes per activity
    Object.keys(activeVotes).forEach(key => {
        const [actId, voter] = key.split('___');
        const reaction = activeVotes[key];
        if (summary[actId]) {
            if (reaction === 'like') summary[actId].likes++;
            else if (reaction === 'unlike') summary[actId].dislikes++;
        }

        if (cleanUser && voter === cleanUser) {
            userVotes[actId] = reaction;
        }
    });

    return {
        summary,
        userVotes
    };
}

// Parent Analytics & Aggregation
function getParentAnalytics(nicknameFilter = null) {
    ensureStorage();
    const sessionData = readJson(SESSIONS_FILE);
    const feedbackData = readJson(FEEDBACK_FILE);
    const allSessions = sessionData.sessions || [];
    const allFeedback = feedbackData.feedback || [];

    const sessions = nicknameFilter
        ? allSessions.filter(s => s.nickname.toLowerCase() === nicknameFilter.toLowerCase())
        : allSessions;

    const feedback = nicknameFilter
        ? allFeedback.filter(f => f.nickname.toLowerCase() === nicknameFilter.toLowerCase())
        : allFeedback;

    let totalTrials = 0;
    let correctTrials = 0;
    let totalAttempts = 0;
    let totalDurationSeconds = 0;
    let totalLatencyMs = 0;
    let latencySampleCount = 0;

    const activityStats = {};

    sessions.forEach(sess => {
        const start = new Date(sess.startedAt).getTime();
        const end = sess.endedAt ? new Date(sess.endedAt).getTime() : start + (sess.events.length * 10000);
        totalDurationSeconds += Math.max(0, Math.round((end - start) / 1000));

        sess.events.forEach(evt => {
            const actId = evt.activityId || 'general';
            if (!activityStats[actId]) {
                activityStats[actId] = {
                    activityId: actId,
                    trials: 0,
                    correct: 0,
                    attempts: 0,
                    latencySum: 0,
                    latencyCount: 0,
                    abandonedCount: 0,
                    completedRounds: 0,
                    lastPlayed: null
                };
            }

            const stat = activityStats[actId];
            stat.lastPlayed = evt.timestamp;

            if (evt.type === 'trial_result') {
                totalTrials++;
                stat.trials++;
                totalAttempts += (evt.attempts || 1);
                stat.attempts += (evt.attempts || 1);

                if (evt.isCorrect) {
                    correctTrials++;
                    stat.correct++;
                }

                if (typeof evt.latencyMs === 'number' && evt.latencyMs > 200 && evt.latencyMs < 60000) {
                    totalLatencyMs += evt.latencyMs;
                    latencySampleCount++;
                    stat.latencySum += evt.latencyMs;
                    stat.latencyCount++;
                }
            } else if (evt.type === 'activity_end' && !evt.completed) {
                stat.abandonedCount++;
            } else if (evt.type === 'round_completed') {
                stat.completedRounds++;
            }
        });
    });

    const accuracyRate = totalTrials > 0 ? Math.round((correctTrials / totalTrials) * 100) : 0;
    const avgResponseTimeSec = latencySampleCount > 0 ? (totalLatencyMs / latencySampleCount / 1000).toFixed(1) : 0;

    // Calculate per-activity metrics & recommendations
    const activityReport = Object.values(activityStats).map(stat => {
        const accuracy = stat.trials > 0 ? Math.round((stat.correct / stat.trials) * 100) : 0;
        const avgAttempts = stat.trials > 0 ? (stat.attempts / stat.trials).toFixed(1) : 1;
        const avgLatency = stat.latencyCount > 0 ? (stat.latencySum / stat.latencyCount / 1000).toFixed(1) : 0;

        const actFeedback = feedback.filter(f => f.activityId === stat.activityId);
        const likes = actFeedback.filter(f => f.reaction === 'like').length;
        const dislikes = actFeedback.filter(f => f.reaction === 'unlike').length;

        // Adaptive Classification:
        // Strength: high accuracy (>= 80%)
        // Challenge: low accuracy (< 65%) or high attempts (>= 2.2)
        // Loved: positive feedback
        let tag = 'neutral';
        if (accuracy >= 80 && (likes >= dislikes)) tag = 'strength';
        else if (accuracy < 65 || avgAttempts >= 2.2) tag = 'challenge';
        else if (likes > 0 && dislikes === 0) tag = 'loved';

        return {
            ...stat,
            accuracy,
            avgAttempts: parseFloat(avgAttempts),
            avgLatencySec: parseFloat(avgLatency),
            likes,
            dislikes,
            tag
        };
    });

    // Generate Adaptive Recommendations
    const recommendations = generateRecommendations(activityReport, feedback);

    return {
        summary: {
            nickname: nicknameFilter || 'All Children',
            totalSessions: sessions.length,
            totalTrials,
            correctTrials,
            accuracyRate,
            avgResponseTimeSec: parseFloat(avgResponseTimeSec),
            totalDurationMinutes: Math.round(totalDurationSeconds / 60)
        },
        activityReport,
        recentFeedback: feedback.slice(-15).reverse(),
        recommendations
    };
}

// Adaptive Recommendation Engine
function generateRecommendations(activityReport, feedback) {
    const list = [];

    // Find greatest strength to build early confidence
    const strengths = activityReport.filter(a => a.tag === 'strength' || a.tag === 'loved');
    if (strengths.length > 0) {
        strengths.sort((a, b) => b.accuracy - a.accuracy);
        list.push({
            type: 'confidence_booster',
            activityId: strengths[0].activityId,
            reason: {
                en: `High mastery (${strengths[0].accuracy}% accuracy) and positive engagement. Great to build confidence!`,
                fr: `Excellente maîtrise (${strengths[0].accuracy}% de réussite). Idéal pour débuter en confiance !`
            }
        });
    }

    // Find emerging skill (moderate accuracy between 65% and 80%)
    const emerging = activityReport.filter(a => a.accuracy >= 60 && a.accuracy < 80);
    if (emerging.length > 0) {
        list.push({
            type: 'practice_next',
            activityId: emerging[0].activityId,
            reason: {
                en: `Developing skill (${emerging[0].accuracy}% accuracy). Perfect for active consolidation!`,
                fr: `Compétence en développement (${emerging[0].accuracy}% de réussite). Idéal pour consolider !`
            }
        });
    }

    // Find challenge that needs reduced difficulty (2 choices or XL size)
    const challenges = activityReport.filter(a => a.tag === 'challenge');
    if (challenges.length > 0) {
        list.push({
            type: 'needs_accommodation',
            activityId: challenges[0].activityId,
            reason: {
                en: `More challenging (${challenges[0].accuracy}% accuracy). We recommend starting with 2 choices and XL image size.`,
                fr: `Activité plus exigeante (${challenges[0].accuracy}% de réussite). Conseillé avec 2 choix et taille XL.`
            }
        });
    }

    return list;
}

module.exports = {
    getProfiles,
    getOrCreateProfile,
    startSession,
    recordEvent,
    endSession,
    recordFeedback,
    getFeedbackSummary,
    getParentAnalytics
};
