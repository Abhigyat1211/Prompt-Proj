export async function POST(req: Request) {
  try {
    const { description } = await req.json();

    if (!description || description.trim().length < 5) {
      return Response.json({ error: "Description too short" }, { status: 400 });
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are classifying a civic complaint for a complaint-tracking app.
Reply with ONLY a raw JSON object, no markdown, no explanation, in this exact shape:
{"category": "Roads|Water|Electricity|Sanitation|Public Safety|Other", "urgency": "Low|Medium|High"}

Complaint: "${description}"`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini API error:", errText);
      return Response.json({ error: "AI classification failed" }, { status: 500 });
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return Response.json(parsed);
  } catch (err) {
    console.error("Classify route error:", err);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
