import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";

const CLIENT_ID = process.env.FATSECRET_CLIENT_ID!;
const CLIENT_SECRET = process.env.FATSECRET_CLIENT_SECRET!;

async function getAccessToken(): Promise<string> {
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("scope", "basic");

  const response = await axios.post(
    "https://oauth.fatsecret.com/connect/token",
    params,
    {
      auth: {
        username: CLIENT_ID,
        password: CLIENT_SECRET,
      },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  return response.data.access_token;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const token = await getAccessToken();

    const response = await axios.get(
      "https://platform.fatsecret.com/rest/foods/search/v3",
      {
        params: {
          search_expression: req.query.q,
          page_number: req.query.page || 0,
          max_results: req.query.maxResults || 10,
          format: "json",
          region: "MN",
        },
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    res.status(200).json(response.data);
  } catch (err: any) {
    console.error("FatSecret API error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch food" });
  }
}
