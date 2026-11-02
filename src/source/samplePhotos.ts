/**
 * Illustrated stand-ins for the sample recipes' photos (from the design
 * prototype). Only the local sample data uses them.
 */

export type SamplePhotoKind =
  "borshch" | "syrnyky" | "carbonara" | "shakshuka" | "greek";

const seeded = (seed: number) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

const DEFS =
  "<defs>" +
  '<radialGradient id="lt" cx="28%" cy="18%" r="95%"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></radialGradient>' +
  '<filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="16"/></filter>' +
  '<filter id="sf"><feGaussianBlur stdDeviation="1.4"/></filter>' +
  '<filter id="gr"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .22 0"/></filter>' +
  '<radialGradient id="soup" cx="45%" cy="40%" r="65%"><stop offset="0" stop-color="#c0183f"/><stop offset=".7" stop-color="#8e0f2c"/><stop offset="1" stop-color="#5e0a1d"/></radialGradient>' +
  '<radialGradient id="gold" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#f4cf8a"/><stop offset=".6" stop-color="#d79443"/><stop offset="1" stop-color="#9c5a1e"/></radialGradient>' +
  '<radialGradient id="sauce" cx="45%" cy="40%" r="65%"><stop offset="0" stop-color="#de4f2c"/><stop offset="1" stop-color="#97260f"/></radialGradient>' +
  '<radialGradient id="yolk" cx="38%" cy="35%" r="70%"><stop offset="0" stop-color="#ffd457"/><stop offset="1" stop-color="#e6900a"/></radialGradient>' +
  "</defs>";

export const samplePhoto = (kind: SamplePhotoKind): string => {
  const R = seeded(kind.length * 7919 + kind.charCodeAt(0) * 31);
  const p: string[] = [];
  const f = (n: number) => Math.round(n * 10) / 10;
  const scatter = (
    n: number,
    cx: number,
    cy: number,
    rad: number,
    fn: (x: number, y: number) => void
  ) => {
    for (let i = 0; i < n; i++) {
      const a = R() * Math.PI * 2;
      const r = Math.sqrt(R()) * rad;
      fn(f(cx + Math.cos(a) * r), f(cy + Math.sin(a) * r));
    }
  };
  const plate = (
    cx: number,
    cy: number,
    r: number,
    rim: string,
    well: string
  ) => {
    p.push(
      `<ellipse cx="${cx + 14}" cy="${cy + 22}" rx="${r}" ry="${r}" fill="#000" opacity=".45" filter="url(#sh)"/>`,
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${rim}"/>`,
      `<circle cx="${cx}" cy="${cy}" r="${r * 0.78}" fill="${well}"/>`
    );
  };
  const bg = (c1: string, c2: string) => {
    p.push(`<rect width="800" height="600" fill="${c1}"/>`);
    for (let i = 0; i < 26; i++)
      p.push(
        `<rect x="0" y="${f(R() * 600)}" width="800" height="${f(2 + R() * 10)}" fill="${c2}" opacity="${f(0.1 + R() * 0.25)}"/>`
      );
  };

  if (kind === "borshch") {
    bg("#2a3034", "#3b4348");
    p.push(
      '<rect x="560" y="-40" width="320" height="260" rx="10" fill="#d9cfbf" transform="rotate(12 700 80)"/>'
    );
    plate(400, 310, 235, "#ece6dc", "#d8d0c3");
    p.push('<circle cx="400" cy="310" r="178" fill="url(#soup)"/>');
    scatter(14, 400, 310, 150, (x, y) =>
      p.push(
        `<ellipse cx="${x}" cy="${y}" rx="${f(6 + R() * 10)}" ry="${f(3 + R() * 5)}" fill="#e0ad3a" opacity=".55" transform="rotate(${f(R() * 180)} ${x} ${y})"/>`
      )
    );
    p.push(
      '<g filter="url(#sf)"><ellipse cx="430" cy="285" rx="62" ry="46" fill="#fbf7ef"/><path d="M398 286c12-20 50-22 58 0" stroke="#eadfcd" stroke-width="7" fill="none"/></g>'
    );
    scatter(46, 420, 295, 120, (x, y) =>
      p.push(
        `<path d="M${x} ${y}l${f(R() * 10 - 5)} ${f(-6 - R() * 6)}" stroke="#5f923d" stroke-width="2.6" stroke-linecap="round"/>`
      )
    );
    for (const [bx, by] of [
      [110, 110],
      [190, 70],
      [150, 180],
    ])
      p.push(
        `<circle cx="${bx + 8}" cy="${by + 12}" r="58" fill="#000" opacity=".4" filter="url(#sh)"/><circle cx="${bx}" cy="${by}" r="55" fill="url(#gold)"/><ellipse cx="${bx - 15}" cy="${by - 18}" rx="18" ry="10" fill="#fff" opacity=".35"/>`
      );
    scatter(20, 150, 120, 80, (x, y) =>
      p.push(`<circle cx="${x}" cy="${y}" r="2.5" fill="#f3ecd6"/>`)
    );
  } else if (kind === "syrnyky") {
    bg("#e3dbcc", "#cfc5b3");
    plate(400, 305, 245, "#fbfaf6", "#f1eee7");
    for (const [cx, cy] of [
      [320, 240],
      [470, 230],
      [330, 380],
      [480, 380],
    ])
      p.push(
        `<circle cx="${cx + 5}" cy="${cy + 8}" r="74" fill="#6b4a2a" opacity=".35" filter="url(#sh)"/>`,
        `<circle cx="${cx}" cy="${cy}" r="72" fill="url(#gold)"/><circle cx="${cx}" cy="${cy}" r="50" fill="#e9b065" opacity=".55"/>`
      );
    p.push(
      '<g filter="url(#sf)"><ellipse cx="405" cy="305" rx="48" ry="38" fill="#fffdf7"/></g>'
    );
    scatter(9, 610, 470, 60, (x, y) =>
      p.push(
        `<circle cx="${x}" cy="${y}" r="12" fill="#2f3a6b"/><circle cx="${x - 3}" cy="${y - 4}" r="3" fill="#8c9bd0" opacity=".7"/>`
      )
    );
    scatter(6, 210, 470, 50, (x, y) =>
      p.push(
        `<circle cx="${x}" cy="${y}" r="14" fill="#c8324a"/><circle cx="${x - 4}" cy="${y - 4}" r="4" fill="#f08a9a" opacity=".6"/>`
      )
    );
    p.push(
      '<ellipse cx="560" cy="200" rx="22" ry="10" fill="#4f8a3c" transform="rotate(-30 560 200)"/><ellipse cx="585" cy="215" rx="20" ry="9" fill="#5e9a48" transform="rotate(20 585 215)"/>'
    );
  } else if (kind === "carbonara") {
    bg("#3a2a20", "#4c372a");
    plate(400, 300, 240, "#f1ede6", "#e7e2d9");
    for (let i = 0; i < 70; i++) {
      const a = R() * Math.PI * 2;
      const r = 30 + R() * 140;
      const x = 400 + Math.cos(a) * r;
      const y = 300 + Math.sin(a) * r * 0.9;
      const d = `M${f(x)} ${f(y)}q${f(R() * 120 - 60)} ${f(R() * 120 - 60)} ${f(R() * 160 - 80)} ${f(R() * 100 - 50)}`;
      p.push(
        `<path d="${d}" stroke="#b99139" stroke-width="12" fill="none" stroke-linecap="round" opacity=".7"/><path d="${d}" stroke="#ecc96d" stroke-width="8.5" fill="none" stroke-linecap="round"/>`
      );
    }
    scatter(22, 400, 300, 150, (x, y) =>
      p.push(
        `<rect x="${x}" y="${y}" width="${f(18 + R() * 12)}" height="12" rx="3" fill="#b5523b" transform="rotate(${f(R() * 180)} ${x} ${y})"/><rect x="${x}" y="${y}" width="8" height="12" rx="2" fill="#f1d7c4" transform="rotate(${f(R() * 180)} ${x} ${y})"/>`
      )
    );
    scatter(160, 400, 300, 170, (x, y) =>
      p.push(`<circle cx="${x}" cy="${y}" r="1.6" fill="#2b2420"/>`)
    );
    scatter(18, 400, 300, 120, (x, y) =>
      p.push(`<path d="M${x} ${y}l10 -3l4 7l-11 3z" fill="#fbf3d9"/>`)
    );
  } else if (kind === "shakshuka") {
    bg("#c7b8a2", "#b3a48d");
    p.push(
      '<rect x="600" y="270" width="230" height="44" rx="20" fill="#1a1a1c"/>'
    );
    plate(390, 300, 250, "#1d1d20", "#2a2a2e");
    p.push('<circle cx="390" cy="300" r="212" fill="url(#sauce)"/>');
    scatter(30, 390, 300, 190, (x, y) =>
      p.push(
        `<circle cx="${x}" cy="${y}" r="${f(6 + R() * 10)}" fill="#b8321a" opacity=".7"/>`
      )
    );
    for (const [cx, cy] of [
      [300, 230],
      [480, 240],
      [310, 380],
      [470, 385],
    ])
      p.push(
        `<g filter="url(#sf)"><circle cx="${cx}" cy="${cy}" r="58" fill="#fbf6ec"/><circle cx="${cx + 18}" cy="${cy + 14}" r="40" fill="#fbf6ec"/></g>`,
        `<circle cx="${cx}" cy="${cy}" r="25" fill="url(#yolk)"/><circle cx="${cx - 7}" cy="${cy - 8}" r="6" fill="#fff" opacity=".5"/>`
      );
    scatter(40, 390, 300, 190, (x, y) =>
      p.push(
        `<circle cx="${x}" cy="${y}" r="${f(2 + R() * 3)}" fill="#3f7d32"/>`
      )
    );
    scatter(16, 390, 300, 150, (x, y) =>
      p.push(
        `<rect x="${x}" y="${y}" width="9" height="7" rx="1.5" fill="#f6f2ea" transform="rotate(${f(R() * 90)} ${x} ${y})"/>`
      )
    );
  } else {
    bg("#dfe5ea", "#cfd7de");
    plate(400, 300, 245, "#2f5d8a", "#f4f6f8");
    scatter(16, 400, 300, 160, (x, y) =>
      p.push(
        `<circle cx="${x}" cy="${y}" r="30" fill="#cfe6b0" stroke="#3f7a2c" stroke-width="5"/><circle cx="${x}" cy="${y}" r="10" fill="#b7d48f"/>`
      )
    );
    scatter(14, 400, 300, 160, (x, y) => {
      const rot = f(R() * 360);
      p.push(
        `<path d="M${x - 34} ${y}a34 34 0 0 1 68 0z" fill="#d6372a" transform="rotate(${rot} ${x} ${y})"/><path d="M${x - 22} ${y}a22 22 0 0 1 44 0z" fill="#f07158" transform="rotate(${rot} ${x} ${y})"/>`
      );
    });
    scatter(8, 400, 300, 150, (x, y) =>
      p.push(
        `<circle cx="${x}" cy="${y}" r="${f(16 + R() * 10)}" fill="none" stroke="#9a4a88" stroke-width="4"/>`
      )
    );
    p.push(
      '<rect x="335" y="250" width="140" height="100" rx="6" fill="#f7f5ef" transform="rotate(-8 405 300)"/>'
    );
    scatter(30, 405, 290, 55, (x, y) =>
      p.push(`<circle cx="${x}" cy="${y}" r="2" fill="#6d7a3a"/>`)
    );
    scatter(10, 400, 300, 170, (x, y) =>
      p.push(
        `<ellipse cx="${x}" cy="${y}" rx="15" ry="11" fill="#2a1d24"/><ellipse cx="${x - 4}" cy="${y - 4}" rx="4" ry="2.5" fill="#fff" opacity=".35"/>`
      )
    );
  }

  p.push(
    '<rect width="800" height="600" fill="url(#lt)"/><rect width="800" height="600" filter="url(#gr)" opacity=".5"/>'
  );
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">${DEFS}${p.join("")}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};
