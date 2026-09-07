/**
 * Proxies contact submissions to Web3Forms so the access key never ships in static HTML.
 * Set WEB3FORMS_ACCESS_KEY in Vercel project environment variables.
 */
const WEB3FORMS_URL = "https://api.web3forms.com/submit";
const MAX = { name: 200, email: 254, company: 200, project_type: 120, message: 8000, captcha: 8000 };

function trim(str, max) {
  const s = String(str ?? "").trim();
  return s.length > max ? s.slice(0, max) : s;
}

function buildMessage({ company, project_type, message }) {
  const parts = [];
  if (project_type) parts.push(`Project type: ${project_type}`);
  if (company) parts.push(`Company: ${company}`);
  parts.push(message || "");
  return parts.join("\n\n").trim().slice(0, MAX.message);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false });
  }

  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    console.error("submit-contact: WEB3FORMS_ACCESS_KEY is not set");
    return res.status(503).json({ success: false, message: "Service unavailable." });
  }

  const allowed = (process.env.CONTACT_ALLOWED_ORIGIN || "").trim();
  const origin = (req.headers.origin || "").trim();
  if (allowed && origin && origin !== allowed) {
    return res.status(403).json({ success: false, message: "Forbidden." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ success: false, message: "Invalid request." });
    }
  }
  if (!body || typeof body !== "object") {
    return res.status(400).json({ success: false, message: "Invalid request." });
  }

  const name = trim(body.name, MAX.name);
  const email = trim(body.email, MAX.email);
  const company = trim(body.company, MAX.company);
  const project_type = trim(body.project_type, MAX.project_type);
  const message = trim(body.message, MAX.message);
  const captcha = trim(body.hCaptchaResponse, MAX.captcha);

  if (!name || !email || !project_type || !message || message.length < 10) {
    return res.status(400).json({ success: false, message: "Missing or invalid fields." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: "Invalid email." });
  }
  if (!captcha) {
    return res.status(400).json({ success: false, message: "Verification required." });
  }

  const outbound = {
    access_key: accessKey,
    subject: "New project inquiry from TarsOnlineCafe",
    from_name: "TarsOnlineCafe Portfolio",
    name,
    email,
    replyto: email,
    message: buildMessage({ company, project_type, message }),
    "h-captcha-response": captcha,
    redirect: "false",
  };

  try {
    const wres = await fetch(WEB3FORMS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(outbound),
    });
    const json = await wres.json().catch(() => ({}));

    if (wres.ok && json.success) {
      return res.status(200).json({ success: true });
    }
    console.error("submit-contact: Web3Forms non-success", wres.status);
    return res.status(502).json({
      success: false,
      message: "Submission could not be completed. Please try again later.",
    });
  } catch (err) {
    console.error("submit-contact: upstream error", err);
    return res.status(502).json({
      success: false,
      message: "Submission could not be completed. Please try again later.",
    });
  }
}
