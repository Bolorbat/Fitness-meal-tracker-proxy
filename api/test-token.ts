import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("scope", "basic");

    const response = await axios.post(
      "https://oauth.fatsecret.com/connect/token",
      params,
      {
        auth: {
          username: process.env.FATSECRET_CLIENT_ID!,
          password: process.env.FATSECRET_CLIENT_SECRET!,
        },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    res.status(200).json(response.data);
  } catch (err: any) {
    console.error("Token fetch error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to get token" });
  }
}
