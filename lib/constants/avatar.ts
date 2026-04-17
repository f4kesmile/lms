const DEFAULT_AVATAR_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="none">
  <defs>
    <linearGradient id="bg" x1="32" y1="24" x2="224" y2="232" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0f172a" />
      <stop offset="0.55" stop-color="#1d4ed8" />
      <stop offset="1" stop-color="#14b8a6" />
    </linearGradient>
    <radialGradient id="shine" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(74 64) rotate(50) scale(142 142)">
      <stop stop-color="#ffffff" stop-opacity="0.28" />
      <stop offset="1" stop-color="#ffffff" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="256" height="256" rx="72" fill="url(#bg)" />
  <circle cx="88" cy="76" r="64" fill="url(#shine)" />
  <circle cx="128" cy="104" r="42" fill="#e2e8f0" fill-opacity="0.96" />
  <path d="M62 204c10-38 41-56 66-56s56 18 66 56" fill="#e2e8f0" fill-opacity="0.96" />
  <path d="M111 101c7 9 27 9 34 0" stroke="#0f172a" stroke-width="8" stroke-linecap="round" />
  <circle cx="112" cy="95" r="4.5" fill="#0f172a" />
  <circle cx="144" cy="95" r="4.5" fill="#0f172a" />
</svg>`;

export const DEFAULT_AVATAR_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(
  DEFAULT_AVATAR_SVG,
)}`;
