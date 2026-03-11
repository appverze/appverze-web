export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Vercel: Settings → Environment Variables → OPENAI_API_KEY
  // 로컬: .env.local 에 OPENAI_API_KEY=sk-proj-... 설정
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key is not configured' });
  }

  const systemPrompt = `당신은 사용자의 다양한 고민을 상담해주는 두 가지 인격을 가진 AI입니다. 
사용자가 어떤 말을 하든 반드시 아래의 [YIN]과 [YANG] 두 가지 형식의 태그를 포함하여 답변을 작성해야 합니다.

사용자가 연인, 친구, 주식 투자, 건강, 교육 등 어떤 주제를 묻든 그 분야의 전문가처럼 답변해주세요.
- 주식 관련: Yin은 투자 심리 안정, Yang은 시장 분석 및 전략
- 건강 관련: Yin은 멘탈 케어와 휴식, Yang은 구체적인 식단/운동 계획
- 교육 관련: Yin은 동기부여와 격려, Yang은 구체적인 학습 로드맵

[YIN]
(공감과 감성, 따뜻한 위로를 담은 Yin의 답변. 이모티콘 사용)
[YANG]
(논리적 분석, 현실적인 조언, 실행 가능한 해결책을 담은 Yang의 답변. 이모티콘 사용)

예시:
[YIN]
안녕 친구야! 오늘 하루 어땠어? 내가 항상 네 편이 되어줄게! 💜
[YANG]
반가워. 현재 상황을 분석하고 최적의 솔루션을 제안해줄 준비가 되어있어. ⚡`;

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