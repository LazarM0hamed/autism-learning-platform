// Cloudflare Pages Serverless Function: Feedback Summary & User Votes
// Returns aggregated likes/dislikes per activity across all devices

const DEFAULT_ACTIVITIES = [
    'find_and_match', 'colors', 'pattern', 'letters_puzzle',
    'coloring', 'spelling', 'spatial', 'math', 'comparisons',
    'time', 'sequence', 'labyrinth', 'sounds', 'circuit',
    'causality', 'builder', 'basket', 'music', 'classification',
    'hide_and_seek', 'lines', 'body', 'language', 'syllables', 'emotions', 'counting', 'prepositions', 'word_builder', 'patterns', 'math_cp', 'calm', 'intruder'
];

function initDefaultSummary() {
    const summary = {};
    DEFAULT_ACTIVITIES.forEach(id => {
        summary[id] = { likes: 0, dislikes: 0, comments: [] };
    });
    return summary;
}

export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}

export async function onRequestGet(context) {
    try {
        const url = new URL(context.request.url);
        const nickname = (url.searchParams.get('nickname') || '').trim();
        const deviceId = (url.searchParams.get('deviceId') || '').trim();

        const voterKey = (deviceId && (!nickname || nickname.toLowerCase() === 'champion'))
            ? `dev_${deviceId.toLowerCase()}`
            : nickname.toLowerCase();

        const kv = context.env.ALP_KV || context.env.FEEDBACK_KV || context.env.KV;

        let summary = null;
        let votes = null;

        if (kv) {
            try {
                summary = await kv.get('feedback_summary', 'json');
                votes = await kv.get('feedback_votes', 'json');
            } catch (e) {}
        }

        if (!summary) summary = initDefaultSummary();
        if (!votes) votes = {};

        const userVotes = {};
        if (voterKey) {
            Object.keys(votes).forEach(key => {
                const [actId, voter] = key.split('___');
                if (voter === voterKey) {
                    userVotes[actId] = votes[key];
                }
            });
        }

        return new Response(JSON.stringify({
            success: true,
            summary,
            userVotes
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
