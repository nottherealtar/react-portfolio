export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, subject, message, token } = req.body;


    // Discord bot token and your Discord user ID from environment variables
    const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
    const DISCORD_USER_ID = process.env.DISCORD_USER_ID;

    if (!DISCORD_BOT_TOKEN || !DISCORD_USER_ID) {
        console.error('contact: Discord env not configured');
        return res.status(503).json({ error: 'Service unavailable.' });
    }

    // Helper to truncate fields to Discord's max length
    function truncate(str, max = 1024) {
        if (!str) return "N/A";
        return str.length > max ? str.slice(0, max - 3) + "..." : str;
    }

    // Compose the embed payload
    const embed = {
        title: "New Inquiry",
        color: 0x4f46e5,
        fields: [
            { name: "👤 Name", value: truncate(name), inline: false },
            { name: "✉️ Email", value: truncate(email), inline: false },
            { name: "📝 Subject", value: truncate(subject), inline: false },
            { name: "💬 Message", value: truncate(message), inline: false }
        ],
        footer: {
            text: "TarsOnlineCafe Portfolio Contact",
            icon_url: "https://www.tarsonlinecafe.work/67793100.png"
        },
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
            console.error('contact: Discord create DM failed', dmRes.status);
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
            const errorText = await msgRes.text();
            console.error('contact: Discord send message failed', msgRes.status);
            // Check for Discord error code 50007 (Cannot send messages to this user)
            if (errorText.includes('"code": 50007')) {
                return res.status(502).json({
                    error: 'Failed to send DM',
                    details: 'Cannot send messages to this user. Check Discord privacy settings and that the bot shares a server with you.',
                });
            }
            return res.status(502).json({ error: 'Failed to send DM' });
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('contact: handler error', err);
        return res.status(500).json({ error: 'Server error' });
    }
}
