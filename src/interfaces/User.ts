interface Score {
  exp: number;
  games: {
    won: {
      skill: number;
      skins: number;
    }
  }
}

interface ExtendedScore {
  level: number;
  exp: number;
  games: {
    won: {
      skill: number;
      skins: number;
    }
  }
}

export interface User {
  userId: string;
  username: string;
  discriminator: string;
  avatarUrl: string;
  score: ExtendedScore;
  day: Score,
  week: Score
}