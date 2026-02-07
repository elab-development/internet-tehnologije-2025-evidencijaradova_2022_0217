import axios from 'axios';

export async function generateAIReportFromText(text) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('Missing GROQ_API_KEY in .env');

  const model = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

  const system = `
You are an academic writing assistant.
Return ONLY valid JSON with these fields:
aiScore (number 0-100),
summary (string),
reccomendations (string).
No markdown, no extra text.
`;

  const user = `
Analyze the following student work.
Give an AI score that reflects overall writing quality, structure, clarity, and academic tone.
Text:
${text}
`;

  try {
    const resp = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model,
        messages: [
          { role: 'system', content: system.trim() },
          { role: 'user', content: user.trim() },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 60_000,
      },
    );
  } catch (err) {
    console.log(err);
  }

  const content = resp?.data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('AI service returned empty content');

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    console.log(err);
    throw new Error('AI service did not return valid JSON');
  }

  const aiScore = Number(parsed.aiScore);
  return {
    aiScore: Number.isFinite(aiScore) ? aiScore : 0,
    summary: typeof parsed.summary === 'string' ? parsed.summary : '',
    reccomendations:
      typeof parsed.reccomendations === 'string' ? parsed.reccomendations : '',
  };
}