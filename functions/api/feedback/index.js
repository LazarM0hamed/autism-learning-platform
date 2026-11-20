// Cloudflare Pages Serverless Function: Feedback (Likes, Unlikes, Notes)
// Persists multi-user reactions globally across devices via Cloudflare KV (ALP_KV)

const DEFAULT_ACTIVITIES = [
    'find_and_match', 'colors', 'pattern', 'letters_puzzle',
    'coloring', 'spelling', 'spatial', 'math', 'comparisons',
    'time', 'sequence', 'labyrinth', 'sounds', 'circuit',
    'causality', 'builder', 'basket', 'music', 'classification',
    'hide_and_seek', 'lines', 'body', 'language', 'syllables', 'emotions', 'counting'
];

function initDefaultSummary() {
    const summary = {};
    DEFAULT_ACTIVITIES.forEach(id => {
        summary[id] = { likes: 0, dislikes: 0, comments: [] };
    });
    return summary;
}

// In-memory fallback if KV namespace is not yet bound in Cloudflare dashboard
const MEMORY_STORE = {
    summary: initDefaultSummary(),
    votes: {},
    comments: []
};

export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}

export async function onRequestPost(context) {
    try {
        const body = await context.request.json();
        const { sessionId, nickname, deviceId, activityId, categoryId, reaction, comment } = body;

        const cleanNick = (nickname || 'Champion').trim();
        const cleanAct = (activityId || 'general').trim();
        const cleanCat = (categoryId || 'all').trim();
        const cleanComment = (comment || '').trim();
        const cleanDev = (deviceId || '').trim();

        // Voter identification: if nickname is default 'Champion' or empty, isolate by deviceId so multiple anonymous devices count as distinct votes
        const voterKey = (cleanDev && (!nickname || cleanNick.toLowerCase() === 'champion'))
            ? `dev_${cleanDev.toLowerCase()}`
            : cleanNick.toLowerCase();

        const kv = context.env.ALP_KV || context.env.FEEDBACK_KV || context.env.KV;

        let summary = null;
        let votes = null;

        if (kv) {
            try {
                summary = await kv.get('feedback_summary', 'json');
                votes = await kv.get('feedback_votes', 'json');
            } catch (e) {}
        }

        if (!summary) summary = kv ? initDefaultSummary() : MEMORY_STORE.summary;
        if (!votes) votes = kv ? {} : MEMORY_STORE.votes;

        if (!summary[cleanAct]) {
            summary[cleanAct] = { likes: 0, dislikes: 0, comments: [] };
        }

        let noteItem = null;
        if (cleanComment) {
            noteItem = {
                id: 'note_' + Date.now(),
                sessionId: sessionId || null,
                nickname: cleanNick,
                activityId: cleanAct,
                categoryId: cleanCat,
                comment: cleanComment,
                createdAt: new Date().toISOString()
            };
            summary[cleanAct].comments = summary[cleanAct].comments || [];
            summary[cleanAct].comments.push({
                nickname: cleanNick,
                comment: cleanComment,
                createdAt: noteItem.createdAt
            });
        }

        let finalUserReaction = null;
        if (reaction && reaction !== 'neutral') {
            const voteKey = `${cleanAct}___${voterKey}`;
            const previousReaction = votes[voteKey] || null;

            if (previousReaction === reaction) {
                // Toggle off
                delete votes[voteKey];
                finalUserReaction = null;
                if (reaction === 'like') {
                    summary[cleanAct].likes = Math.max(0, (summary[cleanAct].likes || 0) - 1);
                } else if (reaction === 'unlike') {
                    summary[cleanAct].dislikes = Math.max(0, (summary[cleanAct].dislikes || 0) - 1);
                }
            } else {
                // Switch or new vote
                votes[voteKey] = reaction;
                finalUserReaction = reaction;

                if (previousReaction === 'like') {
                    summary[cleanAct].likes = Math.max(0, (summary[cleanAct].likes || 0) - 1);
                } else if (previousReaction === 'unlike') {
                    summary[cleanAct].dislikes = Math.max(0, (summary[cleanAct].dislikes || 0) - 1);
                }

                if (reaction === 'like') {
                    summary[cleanAct].likes = (summary[cleanAct].likes || 0) + 1;
                } else if (reaction === 'unlike') {
                    summary[cleanAct].dislikes = (summary[cleanAct].dislikes || 0) + 1;
                }
            }
        }

        if (kv) {
            await kv.put('feedback_summary', JSON.stringify(summary));
            await kv.put('feedback_votes', JSON.stringify(votes));
        }

        return new Response(JSON.stringify({
            success: true,
            userReaction: finalUserReaction,
            summary,
            note: noteItem
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
