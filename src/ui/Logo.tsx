const PETAL_ANGLES = [0, 72, 144, 216, 288];

/** Five-petal flower, the app's mark. */
const Logo = ({ size = 34 }: { size?: number }) => (
  <svg
    className="logo-mark"
    viewBox="0 0 32 32"
    width={size}
    height={size}
    aria-hidden
  >
    <g className="logo-mark__petals">
      {PETAL_ANGLES.map((a) => (
        <ellipse
          key={a}
          cx="16"
          cy="8.6"
          rx="5.4"
          ry="7.4"
          transform={`rotate(${a} 16 16)`}
        />
      ))}
    </g>
    <circle className="logo-mark__core" cx="16" cy="16" r="4.6" />
  </svg>
);

export default Logo;
