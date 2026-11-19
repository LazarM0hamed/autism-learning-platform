// Cloudflare Pages Serverless Function: Session Initialization & Total Connection Counter
// Tracks global connection count and starts an anonymous or named session

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
        let body = {};
        try {
            body = await context.request.json();
        } catch (e) {}

        const nickname = (body.nickname || 'Champion').trim();
        const deviceId = (body.deviceId || 'unknown_device').trim();

        const kv = context.env.ALP_KV || context.env.FEEDBACK_KV || context.env.KV;

        let totalConnections = 1;
        if (kv) {
            try {
                const cur = await kv.get('total_connections');
                totalConnections = (parseInt(cur || '0', 10)) + 1;
                await kv.put('total_connections', totalConnections.toString());
            } catch (e) {
                totalConnections = 1;
            }
        } else {
            globalThis.__ALP_TOTAL_CONNECTIONS = (globalThis.__ALP_TOTAL_CONNECTIONS || 0) + 1;
            totalConnections = globalThis.__ALP_TOTAL_CONNECTIONS;
        }

        const session = {
            id: 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            nickname,
            deviceId,
            startedAt: new Date().toISOString()
        };

        return new Response(JSON.stringify({
            success: true,
            session,
            totalConnections
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

export async function onRequestGet(context) {
    try {
        const kv = context.env.ALP_KV || context.env.FEEDBACK_KV || context.env.KV;
        let totalConnections = 0;
        if (kv) {
            try {
                const cur = await kv.get('total_connections');
                totalConnections = parseInt(cur || '0', 10);
            } catch (e) {}
        } else {
            totalConnections = globalThis.__ALP_TOTAL_CONNECTIONS || 0;
        }

        return new Response(JSON.stringify({
            success: true,
            totalConnections
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
