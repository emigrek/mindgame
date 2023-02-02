const HEART_EMOJIS = ['❤️', '🧡', '💛', '💚', '💙', '💜'];

const getRandomHeartEmoji = (): string => {
  return HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];
}

export { getRandomHeartEmoji };