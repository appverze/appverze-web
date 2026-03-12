export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image-preview';

  if (!apiKey) {
    return res.status(500).json({
      error: 'Gemini API key is not configured. Set GEMINI_API_KEY in Vercel.',
    });
  }

  const { prompt, title } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    `Create one cinematic concept image for this APPVERZE room.\n` +
                    `Title: ${title || 'APPVERZE Room'}\n` +
                    `Style: futuristic 3D environment concept art, immersive lighting, premium, highly detailed, no text in image.\n` +
                    `Prompt: ${prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'Gemini image generation failed',
        details: data,
      });
    }

    const candidates = Array.isArray(data?.candidates) ? data.candidates : [];
    let imagePart = null;
    let textPart = null;

    for (const candidate of candidates) {
      const parts = candidate?.content?.parts || [];
      for (const part of parts) {
        if (!textPart && part?.text) {
          textPart = part.text;
        }
        if (!imagePart && (part?.inlineData || part?.inline_data)) {
          imagePart = part.inlineData || part.inline_data;
        }
      }
    }

    if (!imagePart?.data) {
      return res.status(502).json({
        error: 'Gemini returned no image data',
        details: data,
      });
    }

    return res.status(200).json({
      imageBase64: imagePart.data,
      mimeType: imagePart.mimeType || imagePart.mime_type || 'image/png',
      text: textPart || '',
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error',
      details: error?.message || 'Unknown error',
    });
  }
}
