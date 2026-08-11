import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { getPublicNavigation } from "@/config/navigation";
import {
  getPublishedPosts,
  getPublicSiteSettings,
  getVisibleProjects,
} from "@/server/queries/public-content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts, settings] = await Promise.all([
    getVisibleProjects(),
    getPublishedPosts(),
    getPublicSiteSettings(),
  ]);
  const staticRoutes = [
    ...getPublicNavigation(settings).map((item) => item.href),
    "/resume",
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: `${siteConfig.url}${path}`,
      lastModified: new Date(),
      changeFrequency:
        path === "/" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "/" ? 1 : 0.7,
    })),
    ...projects.map((project) => ({
      url: `${siteConfig.url}/projects/${project.slug}`,
      lastModified: project.updatedAt,
      changeFrequency: "monthly" as const,
      priority: project.featured ? 0.9 : 0.7,
    })),
    ...posts.map((post) => ({
      url: `${siteConfig.url}/blog/${post.slug}`,
      lastModified: post.publishedAt ?? new Date(),
      changeFrequency: "monthly" as const,
      priority: post.featured ? 0.9 : 0.7,
    })),
  ];
}
