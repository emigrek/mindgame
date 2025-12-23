import { config } from "@/config";
import { Event } from "@/interfaces";
import { clearExperience } from "@/modules/user-guild-statistics";

export const yearly: Event = {
  name: "yearly",
  run: async () => {
    config.yearlyExperienceWipe && (await clearExperience());
  },
};
