interface Statistics {
  exp: number;
  time: number;
  games: {
    won: {
      skill: number;
      skins: number;
    }
  }
}

interface ExtendedStatistics extends Statistics {
  level: number;
}

export interface User {
  userId: string;
  username: string;
  discriminator: string;
  avatarUrl: string;
  followers: string[];
  stats: ExtendedStatistics;
  day: Statistics,
  week: Statistics,
  month: Statistics
}