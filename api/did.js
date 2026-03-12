export default async function handler(req, res) {
  const apiKey = process.env.DID_API_KEY;
  const baseUrl = process.env.DID_API_BASE_URL || "https://api.d-id.com";

  if (!apiKey) {
    return res.status(500).json({
      error: "D-ID API key is not configured. Set DID_API_KEY in Vercel.",
    });
  }

  const commonHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Basic ${apiKey}`,
  };

  try {
    if (req.method === "POST") {
      const body = req.body || {};

      if (!body.script || !body.source_url) {
        return res.status(400).json({
          error: "Missing required fields: script, source_url",
        });
      }

      const createResp = await fetch(`${baseUrl}/talks`, {
        method: "POST",
        headers: commonHeaders,
        body: JSON.stringify(body),
      });

      const createData = await createResp.json();

      if (!createResp.ok) {
        return res.status(createResp.status).json({
          error: createData?.message || "Failed to create D-ID talk",
          details: createData,
        });
      }

      return res.status(200).json(createData);
    }

    if (req.method === "GET") {
      const { id } = req.query || {};

      if (!id) {
        return res.status(400).json({ error: "Missing talk id query param" });
      }

      const statusResp = await fetch(`${baseUrl}/talks/${id}`, {
        method: "GET",
        headers: commonHeaders,
      });

      const statusData = await statusResp.json();

      if (!statusResp.ok) {
        return res.status(statusResp.status).json({
          error: statusData?.message || "Failed to fetch D-ID talk status",
          details: statusData,
        });
      }

      return res.status(200).json(statusData);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      details: error?.message || "Unknown error",
    });
  }
}

