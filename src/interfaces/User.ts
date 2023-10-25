export interface Statistics {
  exp: number;
  time: {
    public: boolean;
    voice: number;
    presence: number;
  };
  games: {
    won: {
      skill: number;
      skin: number; 
    }
  }
}

export interface ExtendedStatistics extends Statistics {
  level: number;
  commands: number;
}

export interface User {
  userId: string;
  username: string;
  avatarUrl: string;
  stats: ExtendedStatistics;
  day: Statistics,
  week: Statistics,
  month: Statistics
}