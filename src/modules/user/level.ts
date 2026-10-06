import { config } from "@/config/config";

// Level curve: exp = (level / constant)^3. Pure, so it can be tested without the database.
const root = (x: number, n: number) => {
    return Math.pow(Math.E, Math.log(x) / n);
}

export const expToLevel = (exp: number) => {
    return Math.floor(
        root(exp, 3) * config.experience.constant
    );
};

export const levelToExp = (level: number) => {
    return Math.floor(
        Math.pow(level / config.experience.constant, 3)
    );
};
