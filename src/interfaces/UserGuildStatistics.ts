export interface UserStatistics {
  exp: number;
  commands: number;
  messages: number;
  time: {
    voice: number;
    presence: number;
  };
}

export interface ExtendedUserStatistics {
  exp: number;
  commands: number;
  messages: number;
  time: {
    public: boolean;
    voice: number;
    presence: number;
  };
}

export interface UserGuildStatistics {
  userId: string;
  guildId: string;
  level: number;
  total: ExtendedUserStatistics;
  day: UserStatistics;
  week: UserStatistics;
  month: UserStatistics;
}