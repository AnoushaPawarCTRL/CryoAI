import { Link } from "react-router-dom";
import "./Navbar.css";

export function Wordmark() {
  return (
    <Link to="/" className="wordmark" aria-label="CryoAI home">
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
        <circle cx="13" cy="13" r="12" stroke="var(--line-strong)" />
        <path d="M6 15.5 L11 8 L14 12 L16 10 L20.5 15.5 Z" fill="var(--ice)" />
        <path d="M6 15.5 L20.5 15.5" stroke="var(--ice)" strokeWidth="1" />
      </svg>
      CryoAI
    </Link>
  );
}

export default function Navbar() {
  return (
    <header className="navbar">
      <Wordmark />
      <nav className="nav-links">
        <a href="#how">How it works</a>
        <a href="#models">Models</a>
        <a href="https://github.com/AnoushaPawarCTRL/CryoAI" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <Link to="/login" className="btn btn-ghost nav-signin">
          Sign in
        </Link>
      </nav>
    </header>
  );
}
