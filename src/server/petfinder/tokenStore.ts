import { AppError } from '@/server/http/errors';

type Token = { accessToken: string; expiresAt: number };

let cached: Token | null = null;

function getEnv() {
  const baseUrl = process.env.PETFINDER_BASE_URL || 'https://api.petfinder.com/v2';
  const id = process.env.PETFINDER_CLIENT_ID;
  const secret = process.env.PETFINDER_CLIENT_SECRET;
  if (!id || !secret) {
    throw new AppError('PETFINDER_AUTH', 'Petfinder credentials not configured', 502);
  }
  return { baseUrl, id, secret };
}

export const tokenStore = {
  async getToken(): Promise<Token> {
    const now = Date.now();
    if (cached && now < cached.expiresAt - 60_000) return cached;
    return this.refreshToken();
  },

  async refreshToken(): Promise<Token> {
    const { baseUrl, id, secret } = getEnv();
    const url = `${baseUrl}/oauth2/token`;
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: id,
      client_secret: secret,
    });
    const t0 = Date.now();
    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
    } catch (e: any) {
      throw new AppError('PETFINDER_AUTH', `Token request failed: ${e?.message || 'network_error'}`, 502);
    }
    const ms = Date.now() - t0;
    if (!res.ok) {
      const msg = `Token http ${res.status}`;
      if (process.env.NODE_ENV !== 'production') console.warn('petfinder_oauth_error', { status: res.status, ms });
      throw new AppError('PETFINDER_AUTH', msg, 502);
    }
    const json = await res.json();
    const accessToken: string = json.access_token;
    const expiresIn: number = json.expires_in; // seconds
    const expiresAt = Date.now() + (expiresIn * 1000);
    cached = { accessToken, expiresAt };
    return cached;
  },
};

