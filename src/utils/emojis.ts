import emojis from "@/utils/emojisData.json";

type Emoji = {
  codes: string;
  char: string;
  name: string;
  category: string;
  group: string;
  subgroup: string;
};

type Group = "Animals & Nature" | "Smileys & Emotion" | "Food & Drink" | "Travel & Places" | "Activities" | "Objects" | "Symbols" | "Flags";

const getRandomEmojiFromGroup = (group: Group): Emoji => {
  const filtered = emojis.filter((emoji: Emoji) => emoji.group === group);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export { getRandomEmojiFromGroup };