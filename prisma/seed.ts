import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { z } from "zod";

import { defaultTheme, themeDefinitions } from "../src/config/themes";
import {
  certificationSeedData,
  educationSeedData,
  experienceSeedData,
  profileSeedData,
  projectSeedData,
  skillCategorySeedData,
  skillSeedData,
  socialLinkSeedData,
} from "../src/data/seed";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";

/**
 * Safe by default: only inserts missing rows.
 * Set SEED_OVERWRITE=true to restore the old destructive update behavior.
 */
const overwriteExisting = process.env.SEED_OVERWRITE === "true";

const adminSeedSchema = z
  .object({
    ADMIN_NAME: z.string().trim().min(2).optional(),
    ADMIN_USERNAME: z.string().trim().min(3).max(64).optional(),
    ADMIN_EMAIL: z.email().trim().toLowerCase().optional(),
    ADMIN_PASSWORD: z.string().min(1).max(256).optional(),
  })
  .superRefine((values, context) => {
    const provided = [
      values.ADMIN_NAME,
      values.ADMIN_USERNAME,
      values.ADMIN_EMAIL,
      values.ADMIN_PASSWORD,
    ].filter(Boolean).length;

    if (provided !== 0 && provided !== 4) {
      context.addIssue({
        code: "custom",
        message:
          "ADMIN_NAME, ADMIN_USERNAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be provided together.",
      });
    }
  });

function optionalDate(value?: string) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to seed the database.");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    for (const [sortOrder, theme] of themeDefinitions.entries()) {
      const createData = {
        name: theme.name,
        slug: theme.id,
        description: theme.description,
        configuration: {
          mode: theme.mode,
          accent: theme.accent,
          surface: theme.surface,
          personality: theme.personality,
        },
        isDefault: theme.id === defaultTheme,
        active: true,
        sortOrder,
      };

      await prisma.themeDefinition.upsert({
        where: { slug: theme.id },
        create: createData,
        update: overwriteExisting
          ? {
              name: theme.name,
              description: theme.description,
              configuration: createData.configuration,
              isDefault: theme.id === defaultTheme,
              active: true,
              sortOrder,
            }
          : {},
      });
    }

    const existingProfile = await prisma.profile.findFirst({
      select: { id: true },
    });
    const profileData = {
      fullName: profileSeedData.fullName,
      professionalTitle: profileSeedData.professionalTitle,
      shortBio: profileSeedData.shortBio,
      longBio: profileSeedData.longBio ?? Prisma.JsonNull,
      email: profileSeedData.email ?? null,
      phone: profileSeedData.phone ?? null,
      location: profileSeedData.location ?? null,
      availabilityStatus: profileSeedData.availabilityStatus ?? null,
      profileImage: profileSeedData.profileImage ?? null,
      yearsOfExperience: profileSeedData.yearsOfExperience ?? null,
      currentCompany: profileSeedData.currentCompany ?? null,
      currentRole: profileSeedData.currentRole ?? null,
      currentFocus: profileSeedData.currentFocus ?? null,
      learningGoals: [...profileSeedData.learningGoals],
      engineeringValues: [...profileSeedData.engineeringValues],
    };

    if (!existingProfile) {
      await prisma.profile.create({
        data: {
          id: "primary-profile",
          ...profileData,
        },
      });
    } else if (overwriteExisting) {
      await prisma.profile.update({
        where: { id: existingProfile.id },
        data: profileData,
      });
    }

    for (const [sortOrder, link] of socialLinkSeedData.entries()) {
      await prisma.socialLink.upsert({
        where: { url: link.url },
        create: {
          ...link,
          sortOrder,
          visible: true,
        },
        update: overwriteExisting
          ? {
              platform: link.platform,
              label: link.label,
              icon: link.icon ?? null,
              sortOrder,
              visible: true,
            }
          : {},
      });
    }

    for (const [sortOrder, experience] of experienceSeedData.entries()) {
      const existingExperience = await prisma.experience.findFirst({
        where: {
          company: experience.company,
          position: experience.position,
        },
        select: { id: true },
      });
      const experienceData = {
        company: experience.company,
        position: experience.position,
        location: experience.location ?? null,
        startDate: optionalDate(experience.startDate),
        endDate: optionalDate(experience.endDate),
        currentlyWorking: experience.currentlyWorking,
        richDescription: experience.richDescription
          ? (experience.richDescription as Prisma.InputJsonValue)
          : Prisma.DbNull,
        achievements: [...experience.achievements],
        technologies: [...experience.technologies],
        sortOrder,
        featured: experience.featured ?? false,
        visible: true,
      };

      if (!existingExperience) {
        await prisma.experience.create({ data: experienceData });
      } else if (overwriteExisting) {
        await prisma.experience.update({
          where: { id: existingExperience.id },
          data: experienceData,
        });
      }
    }

    for (const [sortOrder, project] of projectSeedData.entries()) {
      await prisma.project.upsert({
        where: { slug: project.slug },
        create: {
          title: project.title,
          slug: project.slug,
          shortDescription: project.shortDescription,
          richDescription: project.richDescription ?? Prisma.JsonNull,
          projectType: project.projectType ?? null,
          clientName: project.clientName ?? null,
          status: project.status,
          technologies: [...project.technologies],
          gallery: [],
          sortOrder,
          featured: project.featured ?? false,
          visible: true,
        },
        update: overwriteExisting
          ? {
              title: project.title,
              shortDescription: project.shortDescription,
              richDescription: project.richDescription ?? Prisma.JsonNull,
              projectType: project.projectType ?? null,
              clientName: project.clientName ?? null,
              status: project.status,
              technologies: [...project.technologies],
              sortOrder,
              featured: project.featured ?? false,
              visible: true,
            }
          : {},
      });
    }

    const categoryIds = new Map<string, string>();
    for (const [sortOrder, category] of skillCategorySeedData.entries()) {
      const record = await prisma.skillCategory.upsert({
        where: { slug: category.slug },
        create: {
          ...category,
          sortOrder,
          visible: true,
        },
        update: overwriteExisting
          ? {
              name: category.name,
              description: category.description,
              icon: category.icon,
              sortOrder,
              visible: true,
            }
          : {},
        select: { id: true, name: true },
      });
      categoryIds.set(record.name, record.id);
      categoryIds.set(category.name, record.id);
    }

    for (const [sortOrder, skill] of skillSeedData.entries()) {
      const categoryId = categoryIds.get(skill.category);
      if (!categoryId) {
        throw new Error(`Missing skill category: ${skill.category}`);
      }

      await prisma.skill.upsert({
        where: { slug: skill.slug },
        create: {
          name: skill.name,
          slug: skill.slug,
          categoryId,
          highlighted: skill.highlighted ?? false,
          sortOrder,
          visible: true,
        },
        update: overwriteExisting
          ? {
              name: skill.name,
              categoryId,
              highlighted: skill.highlighted ?? false,
              sortOrder,
              visible: true,
            }
          : {},
      });
    }

    for (const [sortOrder, certification] of certificationSeedData.entries()) {
      await prisma.certification.upsert({
        where: {
          name_issuer: {
            name: certification.name,
            issuer: certification.issuer,
          },
        },
        create: {
          name: certification.name,
          issuer: certification.issuer,
          issueDate: optionalDate(certification.issueDate),
          credentialId: certification.credentialId ?? null,
          credentialUrl: certification.credentialUrl ?? null,
          description: certification.description ?? null,
          sortOrder,
          featured: true,
          visible: true,
        },
        update: overwriteExisting
          ? {
              issueDate: optionalDate(certification.issueDate),
              credentialId: certification.credentialId ?? null,
              credentialUrl: certification.credentialUrl ?? null,
              description: certification.description ?? null,
              sortOrder,
              featured: true,
              visible: true,
            }
          : {},
      });
    }

    for (const [sortOrder, education] of educationSeedData.entries()) {
      const existingEducation = await prisma.education.findFirst({
        where: {
          institution: education.institution,
          degree: education.degree,
        },
        select: { id: true },
      });
      const educationData = {
        institution: education.institution,
        degree: education.degree,
        field: education.field ?? null,
        startDate: optionalDate(education.startDate),
        endDate: optionalDate(education.endDate),
        description: education.description ?? Prisma.JsonNull,
        sortOrder,
        visible: true,
      };

      if (!existingEducation) {
        await prisma.education.create({ data: educationData });
      } else if (overwriteExisting) {
        await prisma.education.update({
          where: { id: existingEducation.id },
          data: educationData,
        });
      }
    }

    const existingSettings = await prisma.siteSettings.findFirst({
      select: { id: true },
    });
    const settingsData = {
      siteName: `${profileSeedData.fullName} · Developer Portfolio`,
      siteDescription: profileSeedData.shortBio,
      defaultTheme,
      contactEnabled: true,
      blogEnabled: true,
      playgroundEnabled: true,
      analyticsEnabled: false,
      maintenanceMode: false,
      footerText: `Built by ${profileSeedData.fullName}.`,
      seoTitle: `${profileSeedData.fullName} · ${profileSeedData.professionalTitle}`,
      seoDescription: profileSeedData.shortBio,
    };

    if (!existingSettings) {
      await prisma.siteSettings.create({
        data: {
          id: "site-settings",
          ...settingsData,
        },
      });
    } else if (overwriteExisting) {
      await prisma.siteSettings.update({
        where: { id: existingSettings.id },
        data: {
          siteName: settingsData.siteName,
          siteDescription: settingsData.siteDescription,
          seoTitle: settingsData.seoTitle,
          seoDescription: settingsData.seoDescription,
        },
      });
    }

    const adminSeed = adminSeedSchema.parse({
      ADMIN_NAME: process.env.ADMIN_NAME,
      ADMIN_USERNAME: process.env.ADMIN_USERNAME,
      ADMIN_EMAIL: process.env.ADMIN_EMAIL,
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    });

    let adminSeeded = false;
    if (
      adminSeed.ADMIN_NAME &&
      adminSeed.ADMIN_USERNAME &&
      adminSeed.ADMIN_EMAIL &&
      adminSeed.ADMIN_PASSWORD
    ) {
      const passwordHash = await hash(adminSeed.ADMIN_PASSWORD, 12);
      const existingAdministrator = await prisma.user.findFirst({
        where: { role: "ADMIN" },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });

      if (!existingAdministrator) {
        await prisma.user.create({
          data: {
            name: adminSeed.ADMIN_NAME,
            email: adminSeed.ADMIN_EMAIL,
            passwordHash,
            active: true,
          },
        });
        adminSeeded = true;
      } else if (overwriteExisting) {
        await prisma.user.update({
          where: { id: existingAdministrator.id },
          data: {
            name: adminSeed.ADMIN_NAME,
            email: adminSeed.ADMIN_EMAIL,
            passwordHash,
            active: true,
          },
        });
        adminSeeded = true;
      }
    }

    const mode = overwriteExisting ? "overwrite" : "create-missing";
    if (adminSeeded) {
      process.stdout.write(
        `Seed complete (${mode}): content, themes, settings, and administrator.\n`,
      );
    } else if (
      adminSeed.ADMIN_NAME ||
      adminSeed.ADMIN_USERNAME ||
      adminSeed.ADMIN_EMAIL ||
      adminSeed.ADMIN_PASSWORD
    ) {
      process.stdout.write(
        `Seed complete (${mode}): content, themes, and settings. Administrator left unchanged.\n`,
      );
    } else {
      process.stdout.write(
        `Seed complete (${mode}): content, themes, and settings. Administrator skipped (env vars not set).\n`,
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown seed error";
  process.stderr.write(`Database seed failed: ${message}\n`);
  process.exitCode = 1;
});
