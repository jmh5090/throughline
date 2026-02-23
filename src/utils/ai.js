const API_URL = "/.netlify/functions/ai";

export async function aiCall(prompt, maxTokens = 1000) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) {
      console.error("API error:", res.status);
      return null;
    }
    const data = await res.json();
    if (data.error) {
      console.error("API response error:", data.error);
      return null;
    }
    return data.content?.map((b) => b.text || "").join("") || null;
  } catch (e) {
    console.error("aiCall failed:", e);
    return null;
  }
}

export async function aiStream(prompt, onChunk, maxTokens = 1000) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
        stream: true,
      }),
    });
    if (!res.ok) {
      console.error("Stream API error:", res.status);
      return null;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const payload = line.slice(6).trim();
        if (payload === "[DONE]") continue;

        try {
          const event = JSON.parse(payload);
          if (
            event.type === "content_block_delta" &&
            event.delta?.type === "text_delta"
          ) {
            accumulated += event.delta.text;
            onChunk(accumulated);
          }
        } catch {
          // skip malformed JSON
        }
      }
    }

    return accumulated || null;
  } catch (e) {
    console.error("aiStream failed:", e);
    // Fallback to non-streaming
    const result = await aiCall(prompt, maxTokens);
    if (result) onChunk(result);
    return result;
  }
}

export async function aiJSON(prompt, maxTokens = 1000) {
  const raw = await aiCall(prompt, maxTokens);
  if (!raw) return null;
  try {
    return JSON.parse(
      raw
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim()
    );
  } catch {
    return null;
  }
}

export async function aiSearchJSON(prompt, maxTokens = 1500) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: maxTokens,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    const text =
      data.content
        ?.map((b) => b.text || "")
        .filter(Boolean)
        .join("\n") || "";
    const cleaned = text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}
