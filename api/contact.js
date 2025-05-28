export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, subject, message, token } = req.body;

    // Optional: simple token check
    if (token !== 'extra-hot-spicy-chicken-grass') {
        return res.status(403).json({ error: 'Invalid token' });
    }

    // Discord bot token and your Discord user ID from environment variables
    const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
    const DISCORD_USER_ID = process.env.DISCORD_USER_ID;

    if (!DISCORD_BOT_TOKEN || !DISCORD_USER_ID) {
        return res.status(500).json({ error: 'Discord credentials not configured' });
    }

    // Compose the embed payload
    const embed = {
        title: "New Portfolio Inquiry",
        color: 0x4f46e5,
        fields: [
            { name: "Name", value: name || "N/A", inline: false },
            { name: "Email", value: email || "N/A", inline: false },
            { name: "Subject", value: subject || "N/A", inline: false },
            { name: "Message", value: message || "N/A", inline: false }
        ],
        timestamp: new Date().toISOString()
    };

    // Send DM via Discord API
    try {
        // 1. Create DM channel
        const dmRes = await fetch(`https://discord.com/api/v10/users/@me/channels`, {
            method: "POST",
            headers: {
                "Authorization": `Bot ${DISCORD_BOT_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ recipient_id: DISCORD_USER_ID })
        });
        if (!dmRes.ok) {
            return res.status(502).json({ error: 'Failed to create DM channel' });
        }
        const dmData = await dmRes.json();
        const channelId = dmData.id;

        // 2. Send embed message
        const msgRes = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
            method: "POST",
            headers: {
                "Authorization": `Bot ${DISCORD_BOT_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ embeds: [embed] })
        });
        if (!msgRes.ok) {
            return res.status(502).json({ error: 'Failed to send DM' });
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
}
