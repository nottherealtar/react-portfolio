export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, subject, message, token } = req.body;

    // Simple token check (optional, for extra spam protection)
    //if (token !== 'extra-hot-spicy-chicken-grass') {
    //    return res.status(403).json({ error: 'Invalid token' });
    //}

    // Get Zapier webhook URL from environment variable
    const webhookUrl = process.env.ZAPIER_WEBHOOK_URL;
    if (!webhookUrl) {
        return res.status(500).json({ error: 'Webhook URL not configured' });
    }

    try {
        const zapierRes = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, subject, message, token })
        });

        if (!zapierRes.ok) {
            return res.status(502).json({ error: 'Failed to send to Zapier' });
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
}
