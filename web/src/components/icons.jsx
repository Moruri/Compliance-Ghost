// Octicon-inspired line icons. Sized to GitHub's 16px convention.
// Single-color, currentColor-driven, 1.25px stroke. No fills.

export const Icon = {
  Sparkle: (p) => (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" {...p}>
      <path d="M7.53 1.282a.5.5 0 0 1 .94 0l1.2 3.235a3 3 0 0 0 1.813 1.813l3.235 1.2a.5.5 0 0 1 0 .94l-3.235 1.2a3 3 0 0 0-1.813 1.813l-1.2 3.235a.5.5 0 0 1-.94 0l-1.2-3.235a3 3 0 0 0-1.813-1.813l-3.235-1.2a.5.5 0 0 1 0-.94l3.235-1.2A3 3 0 0 0 6.33 4.517z"/>
    </svg>
  ),
  Repo: (p) => (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" {...p}>
      <path fillRule="evenodd" d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 1 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 0 1-1.072 1.05A2.5 2.5 0 0 1 2 11.5v-9zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.49 2.49 0 0 1 4.5 9h8V1.5zm-3.5 9a.75.75 0 0 0-.75.75v2.5a.75.75 0 0 0 1.064.681l.936-.518.936.518A.75.75 0 0 0 12.25 14v-2.75a.75.75 0 0 0-.75-.75H9z"/>
    </svg>
  ),
  Shield: (p) => (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" {...p}>
      <path fillRule="evenodd" d="M7.467.133a1.75 1.75 0 0 1 1.066 0l5.25 1.68A1.75 1.75 0 0 1 15 3.48V7c0 1.566-.32 3.182-1.303 4.682-.983 1.498-2.585 2.813-5.032 3.855a1.75 1.75 0 0 1-1.33 0c-2.447-1.042-4.049-2.357-5.032-3.855C1.32 10.182 1 8.566 1 7V3.48a1.75 1.75 0 0 1 1.217-1.667l5.25-1.68z"/>
    </svg>
  ),
  Graph: (p) => (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" {...p}>
      <path fillRule="evenodd" d="M1.5 1.75a.75.75 0 0 0-1.5 0v12.5c0 .414.336.75.75.75h14.5a.75.75 0 0 0 0-1.5H1.5V1.75zm14.28 2.53a.75.75 0 0 0-1.06-1.06L10 7.94 7.53 5.47a.75.75 0 0 0-1.06 0L3.22 8.72a.75.75 0 0 0 1.06 1.06L7 7.06l2.47 2.47a.75.75 0 0 0 1.06 0l5.25-5.25z"/>
    </svg>
  ),
  Bug: (p) => (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" {...p}>
      <path fillRule="evenodd" d="M4.72.22a.75.75 0 0 1 1.06 0l1 1c.078.077.144.165.197.26A6.6 6.6 0 0 1 8 1.25c.347 0 .686.026 1.018.077a.748.748 0 0 1 .195-.259l1.005-1.003a.75.75 0 1 1 1.06 1.06l-.953.952A4.5 4.5 0 0 1 12.502 6H14a.75.75 0 0 1 0 1.5h-1.5v1h2A.75.75 0 0 1 15 9.75 1.25 1.25 0 0 1 13.75 11h-1.378a5.502 5.502 0 0 1-8.744 0H2.25A1.25 1.25 0 0 1 1 9.75.75.75 0 0 1 1.75 9H3.5V8H2a.75.75 0 0 1 0-1.5h1.5a4.5 4.5 0 0 1 2.171-3.834l-.95-.95a.75.75 0 0 1 0-1.061zM8 12.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
    </svg>
  ),
  Check: (p) => (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" {...p}>
      <path fillRule="evenodd" d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/>
    </svg>
  ),
  CheckCircle: (p) => (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" {...p}>
      <path fillRule="evenodd" d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm3.78-9.72a.75.75 0 0 0-1.06-1.06L6.75 9.19 5.28 7.72a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l4.5-4.5z"/>
    </svg>
  ),
  Dot: (p) => (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" {...p}>
      <circle cx="8" cy="8" r="3.5"/>
    </svg>
  ),
  Alert: (p) => (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" {...p}>
      <path fillRule="evenodd" d="M8.22 1.754a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368L8.22 1.754zM6.462.992c.673-1.234 2.402-1.234 3.076 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.538-2.63L6.462.992zM7.25 5.5a.75.75 0 0 1 1.5 0v2.5a.75.75 0 0 1-1.5 0v-2.5zm0 4.75a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0z"/>
    </svg>
  ),
  Send: (p) => (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" {...p}>
      <path d="M.989 8 .064 2.68a1.342 1.342 0 0 1 1.85-1.462l13.402 5.744a1.13 1.13 0 0 1 0 2.076L1.913 14.782a1.343 1.343 0 0 1-1.85-1.463L.99 8zm.603-5.288L2.38 7.25h4.87a.75.75 0 0 1 0 1.5H2.38l-.788 4.538L13.929 8 1.592 2.712z"/>
    </svg>
  ),
  ArrowRight: (p) => (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" {...p}>
      <path fillRule="evenodd" d="M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06l2.97-2.97H3.75a.75.75 0 0 1 0-1.5h7.44L8.22 4.03a.75.75 0 0 1 0-1.06z"/>
    </svg>
  ),
  Download: (p) => (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" {...p}>
      <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14H2.75z"/>
      <path d="M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969z"/>
    </svg>
  ),
  Chevron: (p) => (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" {...p}>
      <path fillRule="evenodd" d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06z"/>
    </svg>
  ),
  X: (p) => (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" {...p}>
      <path fillRule="evenodd" d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06z"/>
    </svg>
  ),
  Spinner: (p) => (
    <svg viewBox="0 0 16 16" width="16" height="16" {...p}>
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" fill="none"/>
      <path d="M14.5 8a6.5 6.5 0 0 0-6.5-6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none">
        <animateTransform attributeName="transform" type="rotate" from="0 8 8" to="360 8 8" dur="0.9s" repeatCount="indefinite"/>
      </path>
    </svg>
  ),
  Sun: (p) => (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" {...p}>
      <path d="M8 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8zM8 0a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V.75A.75.75 0 0 1 8 0zm0 13a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 13zM2.343 2.343a.75.75 0 0 1 1.06 0l1.061 1.06a.75.75 0 1 1-1.06 1.06L2.343 3.405a.75.75 0 0 1 0-1.062zm9.193 9.193a.75.75 0 0 1 1.06 0l1.062 1.06a.75.75 0 0 1-1.061 1.062l-1.06-1.06a.75.75 0 0 1 0-1.061zM16 8a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 16 8zM3 8a.75.75 0 0 1-.75.75H.75a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 3 8zm10.657-5.657a.75.75 0 0 1 0 1.062l-1.06 1.06a.75.75 0 1 1-1.062-1.06l1.061-1.06a.75.75 0 0 1 1.061 0zm-9.193 9.193a.75.75 0 0 1 0 1.06l-1.06 1.061a.75.75 0 1 1-1.061-1.061l1.06-1.06a.75.75 0 0 1 1.061 0z"/>
    </svg>
  ),
  Moon: (p) => (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" {...p}>
      <path d="M9.598 1.591a.749.749 0 0 1 .785-.175 7.001 7.001 0 1 1-8.967 8.967.75.75 0 0 1 .961-.96 5.5 5.5 0 0 0 7.046-7.046.749.749 0 0 1 .175-.786zm1.616 1.945a7 7 0 0 1-7.678 7.678 5.499 5.499 0 1 0 7.678-7.678z"/>
    </svg>
  ),
};

// Brand mark — Copilot-style 4-point sparkle on a square tile.
export function BrandMark({ size = 28 }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-md"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg,#ec6cb9 0%,#a371f7 50%,#2f81f7 100%)',
      }}
    >
      <svg viewBox="0 0 16 16" width={Math.round(size * 0.62)} height={Math.round(size * 0.62)} fill="white">
        <path d="M7.53 1.282a.5.5 0 0 1 .94 0l1.2 3.235a3 3 0 0 0 1.813 1.813l3.235 1.2a.5.5 0 0 1 0 .94l-3.235 1.2a3 3 0 0 0-1.813 1.813l-1.2 3.235a.5.5 0 0 1-.94 0l-1.2-3.235a3 3 0 0 0-1.813-1.813l-3.235-1.2a.5.5 0 0 1 0-.94l3.235-1.2A3 3 0 0 0 6.33 4.517z"/>
      </svg>
    </span>
  );
}
