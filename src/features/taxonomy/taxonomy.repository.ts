import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { getDatabase } from "@/lib/db/client";

export const taxonomyRepository = {
  saveSkillCategory(
    id: string,
    data: Prisma.SkillCategoryUncheckedCreateInput,
  ) {
    return id
      ? getDatabase().skillCategory.update({ where: { id }, data })
      : getDatabase().skillCategory.create({ data });
  },
  saveSkill(id: string, data: Prisma.SkillUncheckedCreateInput) {
    return id
      ? getDatabase().skill.update({ where: { id }, data })
      : getDatabase().skill.create({ data });
  },
  deleteSkill(id: string) {
    return getDatabase().skill.delete({ where: { id } });
  },
  saveSocialLink(id: string, data: Prisma.SocialLinkUncheckedCreateInput) {
    return id
      ? getDatabase().socialLink.update({ where: { id }, data })
      : getDatabase().socialLink.create({ data });
  },
  deleteSocialLink(id: string) {
    return getDatabase().socialLink.delete({ where: { id } });
  },
  saveUseItem(id: string, data: Prisma.UseItemUncheckedCreateInput) {
    return id
      ? getDatabase().useItem.update({ where: { id }, data })
      : getDatabase().useItem.create({ data });
  },
  deleteUseItem(id: string) {
    return getDatabase().useItem.delete({ where: { id } });
  },
};
