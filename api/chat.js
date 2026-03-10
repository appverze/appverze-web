export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key is not configured' });
  }

  const systemPrompt = `당신은 사용자의 고민을 상담해주는 두 가지 인격을 가진 AI입니다. 
사용자가 '연인' 관련 질문을 하면 연인 관계 고민을, '친구' 관련 질문을 하면 친구와의 갈등 관계를 중점적으로 다뤄주세요.
반드시 아래 형식으로 답변을 작성해주세요:
[YIN]
(공감과 감성, 따뜻한 위로를 담은 Yin의 답변. 이모티콘 사용)
[YANG]
(논리적 분석, 현실적인 조언, 실행 가능한 해결책을 담은 Yang의 답변. 이모티콘 사용)`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch from OpenAI');
    }

    res.status(200).json({ reply: data.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}