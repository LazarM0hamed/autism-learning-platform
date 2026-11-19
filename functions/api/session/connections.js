// Cloudflare Pages Serverless Function: Total Connection Count
// Returns global connection count across all devices

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
