const zodiacData = [
  { e: "♈", s: [3, 21], f: [4, 19] },
  { e: "♉", s: [4, 20], f: [5, 20] },
  { e: "♊", s: [5, 21], f: [6, 20] },
  { e: "♋", s: [6, 21], f: [7, 22] },
  { e: "♌", s: [7, 23], f: [8, 22] },
  { e: "♍", s: [8, 23], f: [9, 22] },
  { e: "♎", s: [9, 23], f: [10, 22] },
  { e: "♏", s: [10, 23], f: [11, 21] },
  { e: "♐", s: [11, 22], f: [12, 21] },
  { e: "♑", s: [12, 22], f: [1, 19] },
  { e: "♒", s: [1, 20], f: [2, 18] },
  { e: "♓", s: [2, 19], f: [3, 20] },
];

export function getZodiacEmoji(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();

  return (
    zodiacData.find(
      ({ s, f }) =>
        (m === s[0] && d >= s[1]) ||
        (m === f[0] && d <= f[1]) ||
        (s[0] > f[0] && (m > s[0] || m < f[0]))
    )?.e ?? "❓"
  );
}

const moonEmojis = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];
const MOON = 29.53058867;
const REF_NEW_MOON = new Date("2000-01-06");

export function getMoonEmoji(date: Date): string {
  const days = (date.getTime() - REF_NEW_MOON.getTime()) / 86400000;
  const phaseIndex = Math.floor(((((days % MOON) + MOON) % MOON) / MOON) * 8);
  return moonEmojis[phaseIndex];
}

export function getSeasonEmoji(date: Date): string {
  const m = date.getMonth() + 1;
  if (m <= 2 || m === 12) return "❄️"; // Winter
  if (m <= 5) return "🌸"; // Spring
  if (m <= 8) return "☀️"; // Summer
  return "🍂"; // Autumn
}
