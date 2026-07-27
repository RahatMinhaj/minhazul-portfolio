import "server-only";

import { getDatabase } from "@/lib/db/client";

export async function getAdminDashboardData() {
  const database = getDatabase();
  const [
    projects,
    publishedProjects,
    skills,
    experiences,
    certifications,
    drafts,
    publishedPosts,
    unreadMessages,
    visitorEvents,
    recentMessages,
    recentVisitorEvents,
  ] = await Promise.all([
    database.project.count(),
    database.project.count({
      where: { visible: true, status: { not: "DRAFT" } },
    }),
    database.skill.count(),
    database.experience.count(),
    database.certification.count(),
    database.blogPost.count({ where: { status: "DRAFT" } }),
    database.blogPost.count({ where: { status: "PUBLISHED" } }),
    database.contactMessage.count({ where: { status: "NEW" } }),
    database.visitorEvent.count(),
    database.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        subject: true,
        status: true,
        createdAt: true,
      },
    }),
    database.visitorEvent.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
      },
      select: { createdAt: true },
    }),
  ]);
  const visitorSeries = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000);
    const key = day.toISOString().slice(0, 10);
    return {
      date: key.slice(5),
      events: recentVisitorEvents.filter(
        (event) => event.createdAt.toISOString().slice(0, 10) === key,
      ).length,
    };
  });

  return {
    metrics: {
      projects,
      publishedProjects,
      skills,
      experiences,
      certifications,
      drafts,
      publishedPosts,
      unreadMessages,
      visitorEvents,
    },
    recentMessages,
    visitorSeries,
  };
}
