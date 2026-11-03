import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wordmark } from "../components/Navbar";
import { loginUser, registerUser } from "../api/auth";
import "./Login.css";

type Mode = "login" | "signup";

const copy = {
  login: {
    title: "Welcome back",
    subtitle: "Sign in to your CryoAI account.",
    submit: "Sign in",
    switchText: "New to CryoAI?",
    switchLink: "Create an account",
    switchTo: "/signup",
  },
  signup: {
    title: "Create your account",
    subtitle: "Save uploads and come back to your icebergs later.",
    submit: "Create account",
    switchText: "Already have an account?",
    switchLink: "Sign in",
    switchTo: "/login",
  },
};

// One form used for both sign in and sign up
export function AuthForm({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const text = copy[mode];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both fields.");
      return;
    }
    if (mode === "signup" && password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") await loginUser(email, password);
      else await registerUser(email, password);
      navigate("/app");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <header className="auth-top">
        <Wordmark />
      </header>

      <main className="auth-main">
        <div className="auth-card">
          <h1>{text.title}</h1>
          <p className="auth-subtitle">{text.subtitle}</p>

          <form onSubmit={handleSubmit} noValidate>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                placeholder="you@organisation.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>

            <label className="field">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </label>

            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? "Please wait…" : text.submit}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <Link to="/app" className="btn btn-ghost auth-submit">
            Continue as guest
          </Link>

          <p className="auth-switch">
            {text.switchText} <Link to={text.switchTo}>{text.switchLink}</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function Login() {
  return <AuthForm mode="login" />;
}
