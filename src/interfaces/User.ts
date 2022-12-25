export interface Statistics {
  exp: number;
  time: {
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

export interface ExtendedStatisticsPayload {
  level?: number;
  commands?: number;
  exp?: number;
  time?: {
    voice?: number;
    presence?: number;
  };
  games?: {
    won?: {
      skill?: number;
      skin?: number;
    }
  }
}

export interface User {
  userId: string;
  tag: string;
  avatarUrl: string;
  followers: string[];
  stats: ExtendedStatistics;
  day: Statistics,
  week: Statistics,
  month: Statistics
}