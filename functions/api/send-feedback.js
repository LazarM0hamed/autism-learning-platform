// Cloudflare Pages Serverless Function: Privacy-Safe User Feedback Delivery
// Receives feedback from parents/therapists and dispatches to your private email inbox
// without ever exposing your email address in the GitHub repository or frontend code.

export async function onRequestPost(context) {
    try {
        const body = await context.request.json();
        const { role, feedbackType, message, replyTo, activityId, nickname } = body;

        if (!message || !message.trim()) {
            return new Response(JSON.stringify({ success: false, error: 'Empty message' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Email destination from Cloudflare Secret Environment Variables (never committed to git)
        const recipientEmail = context.env.FEEDBACK_RECIPIENT_EMAIL || context.env.FEEDBACK_EMAIL;
        const web3formsKey = context.env.WEB3FORMS_ACCESS_KEY;
        const resendKey = context.env.RESEND_API_KEY;

        const emailContent = `
[Autism Learning Platform - Feedback & Suggestion]
Date: ${new Date().toISOString()}
Learner: ${nickname || 'Not specified'}
Role: ${role || 'Not specified'}
Category: ${feedbackType || 'General'}
Activity: ${activityId || 'General'}
Reply Contact: ${replyTo || 'Not provided'}

Message:
${message.trim()}
        `.trim();

        // Method A: Dispatch via Web3Forms anonymous access key if provided
        if (web3formsKey) {
            await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    access_key: web3formsKey,
                    subject: `[Learning Platform] Feedback from ${role || 'User'} (${nickname || 'Learner'})`,
                    from_name: `${nickname || 'Learner'} (${role || 'User'})`,
                    replyto: replyTo || undefined,
                    message: emailContent
                })
            }).catch(() => {});
        }
        // Method B: Dispatch via Resend API if provided
        else if (resendKey && recipientEmail) {
            await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${resendKey}`
                },
                body: JSON.stringify({
                    from: 'Autism Learning Platform <onboarding@resend.dev>',
                    to: recipientEmail,
                    subject: `[Learning Platform] Feedback from ${role || 'User'}`,
                    text: emailContent
                })
            }).catch(() => {});
        }

        return new Response(JSON.stringify({
            success: true,
            delivered: Boolean(web3formsKey || (resendKey && recipientEmail)),
            timestamp: new Date().toISOString()
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
