const BASE = "https://notrack.ai";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36";

async function getCookie() {
  const r = await fetch(BASE + "/chat", {
    headers: {"User-Agent": UA, "Cache-Control": "no-cache"},
    redirect: "follow"
  });
  const sc = r.headers.get("set-cookie") || "";
  return sc.split(",").map(s => s.split(";")[0].trim()).filter(Boolean).join("; ");
}

async function ask(message) {
  const cookie = await getCookie();
  const body = {
    user_input: message,
    mode: "usual",
    model: "C",
    persona: "normal",
    max_turns: 6,
    chat_id: null,
    attachments: [],
    regenerate: false,
    edit: false,
    edit_mid: null
  };

  const r = await fetch(BASE + "/api/dispatch", {
    method: "POST",
    headers: {
      "User-Agent": UA,
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
      ...(cookie ? {Cookie: cookie} : {})
    },
    body: JSON.stringify(body)
  });

  if (!r.ok) {
    const t = await r.text().catch(()=>"");
    throw new Error("NoTrack HTTP " + r.status + " " + t.slice(0,200));
  }

  const reader = r.body.getReader();
  const dec = new TextDecoder();
  let buf = "", full = "", done = false;

  while (true) {
    const {value, done: ended} = await reader.read();
    if (ended) break;
    buf += dec.decode(value, {stream:true});
    let idx;
    while ((idx = buf.indexOf("\n\n")) !== -1) {
      const block = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      for (const line of block.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload) continue;
        try {
          const ev = JSON.parse(payload);
          if (ev.type === "delta") full += ev.chunk || "";
          if (ev.type === "message") full = ev.content || full;
          if (ev.type === "done") done = true;
        } catch {}
      }
    }
  }
  return {response: full, done};
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ok:false,error:"Method not allowed"});
  try {
    const {message} = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ok:false,error:"Pesan kosong"});
    }
    const result = await ask(message.trim());
    return res.status(200).json({ok:true, ...result});
  } catch (e) {
    return res.status(500).json({ok:false,error:e.message || "Server error"});
  }
};