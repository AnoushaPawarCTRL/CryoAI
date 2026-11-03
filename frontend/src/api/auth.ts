import axios from "axios";

export const API_URL = process.env.REACT_APP_API_URL ?? "http://localhost:8000";

const TOKEN_KEY = "cryoai_token";
const EMAIL_KEY = "cryoai_email";

type TokenResponse = { access_token: string; token_type: string };

// Pulls a readable message out of a FastAPI error response
function errorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return "Can't reach the server. Is the backend running?";
    const detail = err.response.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  }
  return fallback;
}

function saveSession(email: string, data: TokenResponse) {
  localStorage.setItem(TOKEN_KEY, data.access_token);
  localStorage.setItem(EMAIL_KEY, email);
}

export async function loginUser(email: string, password: string) {
  try {
    const { data } = await axios.post<TokenResponse>(`${API_URL}/auth/login`, { email, password });
    saveSession(email, data);
  } catch (err) {
    throw new Error(errorMessage(err, "Login failed"));
  }
}

export async function registerUser(email: string, password: string) {
  try {
    const { data } = await axios.post<TokenResponse>(`${API_URL}/auth/register`, { email, password });
    saveSession(email, data);
  } catch (err) {
    throw new Error(errorMessage(err, "Registration failed"));
  }
}

export function currentUserEmail(): string | null {
  return localStorage.getItem(TOKEN_KEY) ? localStorage.getItem(EMAIL_KEY) : null;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
}
