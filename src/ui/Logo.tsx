/** A pot (казанок) with steam, the app's mark. */
const Logo = ({ size = 34 }: { size?: number }) => (
  <svg
    className="logo-mark"
    viewBox="0 0 32 32"
    width={size}
    height={size}
    aria-hidden
  >
    <g className="logo-mark__steam">
      <path d="M12 1.6c-1.5 1-1.5 2 0 3s1.5 2 0 3" />
      <path d="M20 1.6c-1.5 1-1.5 2 0 3s1.5 2 0 3" />
    </g>
    <circle className="logo-mark__warm" cx="16" cy="9.6" r="1.5" />
    <g className="logo-mark__pot">
      <path d="M7 13.5a9 3.5 0 0 1 18 0z" />
      <path d="M4 15.5h24v4.5a8 8 0 0 1-8 8h-8a8 8 0 0 1-8-8z" />
      <rect x="1" y="16.4" width="4" height="2.6" rx="1.3" />
      <rect x="27" y="16.4" width="4" height="2.6" rx="1.3" />
    </g>
  </svg>
);

export default Logo;
