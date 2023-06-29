import { lib } from "winmojilib";

const emojis = Object.assign([], Object.values(lib));

enum Groups {
  AnimalsAndNature = "animals-nature",
  SmileysAndEmotion = "smileys-emotion",
  FoodAndDrink = "food-drink",
  TravelAndPlaces = "travel-places",
  Activities = "activities",
  Objects = "objects",
  Symbols = "symbols",
  Flags = "flags",
}

type Group = Groups.AnimalsAndNature | Groups.SmileysAndEmotion | Groups.FoodAndDrink | Groups.TravelAndPlaces | Groups.Activities | Groups.Objects | Groups.Symbols | Groups.Flags;

type Emoji = {
  char: string;
  keywords: string[];
  name: string;
  group: Group;
  subgroup: string;
  hexcode: string;
};

const getRandomEmojiFromGroup = (group: Group): Emoji => {
  const filtered = emojis.filter((emoji: Emoji) => emoji.group === group);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export { getRandomEmojiFromGroup, Groups };