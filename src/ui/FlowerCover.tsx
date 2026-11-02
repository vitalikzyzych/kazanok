import { memo } from "react";

import { flowerClass } from "./flower";

import { hashString } from "@/domain";

const petals = (
  cx: number,
  cy: number,
  n: number,
  len: number,
  wid: number,
  rot: number,
  cls: string
) =>
  Array.from({ length: n }, (_, i) => (
    <ellipse
      key={`${cls}${i}`}
      className={cls}
      cx={cx}
      cy={cy - len / 2}
      rx={wid}
      ry={len / 2}
      transform={`rotate(${(rot + (i * 360) / n).toFixed(1)} ${cx} ${cy})`}
    />
  ));

/** Three flower shapes: daisy, mallow, peony. */
const bloom = (
  type: number,
  cx: number,
  cy: number,
  r: number,
  rot: number
) => {
  if (type === 0)
    return [
      ...petals(cx, cy, 14, r, r * 0.17, rot, "pt"),
      <circle key="c" className="cr" cx={cx} cy={cy} r={r * 0.3} />,
    ];
  if (type === 1)
    return [
      ...petals(cx, cy, 5, r, r * 0.42, rot, "pt"),
      ...petals(cx, cy, 5, r * 0.62, r * 0.26, rot + 36, "pt2"),
      <circle key="c" className="cr" cx={cx} cy={cy} r={r * 0.2} />,
    ];
  return [
    ...petals(cx, cy, 8, r, r * 0.36, rot, "pt2"),
    ...petals(cx, cy, 8, r * 0.72, r * 0.3, rot + 22.5, "pt"),
    <circle key="c" className="cr" cx={cx} cy={cy} r={r * 0.22} />,
  ];
};

const DOTS = [
  [22, 30],
  [40, 18],
  [70, 26],
  [148, 108],
  [128, 112],
];

/** Cover of a recipe without a photo: flowers in a colour picked from the seed. */
const FlowerCover = memo(({ seed }: { seed: string }) => {
  const h = hashString(seed);
  const rot = (h >>> 7) % 60;
  return (
    <div className={`cover ${flowerClass(seed)}`} aria-hidden>
      <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice">
        {DOTS.map(([x, y], i) => (
          <circle
            key={i}
            className="sd"
            cx={x}
            cy={y}
            r={2 + ((h >>> i) % 3)}
          />
        ))}
        <ellipse
          className="lf"
          cx="62"
          cy="96"
          rx="15"
          ry="6"
          transform="rotate(-28 62 96)"
        />
        <ellipse
          className="lf"
          cx="70"
          cy="74"
          rx="11"
          ry="4.5"
          transform="rotate(38 70 74)"
        />
        <g>{bloom((h >>> 4) % 3, 34, 96, 24, rot / 2)}</g>
        <g>{bloom(h % 3, 112, 52, 58, rot)}</g>
      </svg>
    </div>
  );
});

FlowerCover.displayName = "FlowerCover";

export default FlowerCover;
