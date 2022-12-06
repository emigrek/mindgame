import { Schema } from 'mongoose';
import { User } from '../../interfaces';

// Document interface


const reqString = { type: String, required: true };
const reqNumber = { type: Number, required: true, default: 0 };
// Schema
const schema = new Schema<User>({
  userId: reqString,
  username: reqString,
  discriminator: reqString,
  avatarUrl: reqString,
  exp: reqNumber,
  level: reqNumber,
  day: {
    exp: reqNumber,
    games: {
      won: {
        skill: reqNumber,
        skins:reqNumber,
      }
    }
  },
  week: {
    exp: reqNumber,
    games: {
      won: {
        skill: reqNumber,
        skins: reqNumber,
      }
    }
  },
  games: {
    won: {
      skill: reqNumber,
      skins: reqNumber,
    }
  }
});

export default schema;