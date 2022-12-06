export interface User {
    userId: string;
    username: string;
    discriminator: string;
    avatarUrl: string;
    exp: number;
    level: number;
    day: {
      exp: number;
      games: {
        won: {
          skill: number;
          skins: number;
        }
      }
    },
    week: {
      exp: number;
      games: {
        won: {
          skill: number;
          skins: number;
        }
      }
    }
    games: {
      won: {
        skill: number;
        skins: number;
      }
    }
}