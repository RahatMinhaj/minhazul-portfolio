import "server-only";

import {
  chatPersistenceIsAvailable,
  consumeChatQuota,
} from "@/features/chat/chat.repository";
import {
  chatbotIsConfigured,
  generatePortfolioAnswer,
} from "@/features/chat/chat.provider";
import type {
  ChatAnswer,
  ChatHistoryMessage,
  PortfolioSource,
} from "@/features/chat/types";
import { richTextToPlainText } from "@/lib/content/rich-text";
import { getPublicChatContent } from "@/server/queries/public-content";

export class ChatRateLimitError extends Error {
  constructor(public readonly retryAfterSeconds: number) {
    super("Chat request limit reached.");
  }
}

export class ChatUnavailableError extends Error {}

export function portfolioChatIsAvailable() {
  return (
    chatPersistenceIsAvailable() &&
    chatbotIsConfigured() &&
    Boolean(process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32)
  );
}

export async function answerPortfolioQuestion({
  clientIdentifier,
  history,
  question,
}: {
  clientIdentifier: string;
  history: ChatHistoryMessage[];
  question: string;
}): Promise<ChatAnswer> {
  if (!portfolioChatIsAvailable()) {
    throw new ChatUnavailableError("Portfolio chat is not configured.");
  }

  const quota = await consumeChatQuota(clientIdentifier);
  if (!quota.allowed) throw new ChatRateLimitError(quota.retryAfterSeconds);

  const content = await getPublicChatContent();
  if (content.settings?.maintenanceMode) {
    throw new ChatUnavailableError(
      "Portfolio chat is unavailable during maintenance.",
    );
  }
  const allSources = buildSources(content);
  const sources = selectSources(allSources, question);
  const answer = await generatePortfolioAnswer({ history, question, sources });

  return {
    answer,
    sources: sources.slice(0, 4).map(({ title, href }) => ({ title, href })),
  };
}

function buildSources(
  content: Awaited<ReturnType<typeof getPublicChatContent>>,
): PortfolioSource[] {
  const sources: PortfolioSource[] = [];
  const profile = content.profile;

  if (profile) {
    sources.push({
      id: "profile",
      title: "About Minhazul Islam",
      href: "/about",
      text: [
        profile.fullName,
        profile.professionalTitle,
        profile.shortBio,
        richTextToPlainText(profile.longBio),
        profile.email ? `Public email: ${profile.email}` : "",
        profile.location ? `Location: ${profile.location}` : "",
        profile.availabilityStatus
          ? `Availability: ${profile.availabilityStatus}`
          : "",
        profile.currentCompany ? `Company: ${profile.currentCompany}` : "",
        profile.currentRole ? `Current role: ${profile.currentRole}` : "",
        profile.currentFocus ? `Current focus: ${profile.currentFocus}` : "",
        `Engineering values: ${profile.engineeringValues.join(", ")}`,
      ]
        .filter(Boolean)
        .join("\n"),
    });
  }

  for (const experience of content.experiences) {
    sources.push({
      id: `experience-${experience.id}`,
      title: `${experience.position} at ${experience.company}`,
      href: "/experience",
      text: [
        experience.summary,
        ...experience.achievements,
        `Technologies: ${experience.technologies.join(", ")}`,
      ]
        .filter(Boolean)
        .join("\n"),
    });
  }

  for (const project of content.projects) {
    sources.push({
      id: `project-${project.id}`,
      title: project.title,
      href: `/projects/${project.slug}`,
      text: [
        project.projectType,
        project.shortDescription,
        `Status: ${project.status}`,
        `Technologies: ${project.technologies.join(", ")}`,
      ]
        .filter(Boolean)
        .join("\n"),
    });
  }

  for (const category of content.skillCategories) {
    sources.push({
      id: `skills-${category.id}`,
      title: `${category.name} skills`,
      href: "/skills",
      text: [
        category.description,
        category.skills.map((skill) => skill.name).join(", "),
      ]
        .filter(Boolean)
        .join("\n"),
    });
  }

  for (const certification of content.certifications) {
    sources.push({
      id: `certification-${certification.id}`,
      title: certification.name,
      href: "/certifications",
      text: [certification.issuer, certification.description]
        .filter(Boolean)
        .join("\n"),
    });
  }

  for (const education of content.education) {
    if (education.degree.toLowerCase() === "needs confirmation") continue;
    sources.push({
      id: `education-${education.id}`,
      title: education.degree,
      href: "/education",
      text: [
        education.institution,
        education.field,
        richTextToPlainText(education.description),
      ]
        .filter(Boolean)
        .join("\n"),
    });
  }

  for (const post of content.posts) {
    sources.push({
      id: `article-${post.id}`,
      title: post.title,
      href: `/blog/${post.slug}`,
      text: [post.excerpt, post.tags.join(", ")].join("\n"),
    });
  }

  if (content.useItems.length) {
    sources.push({
      id: "uses",
      title: "Tools and working environment",
      href: "/uses",
      text: content.useItems
        .map(
          (item) => `${item.category}: ${item.name}. ${item.description ?? ""}`,
        )
        .join("\n"),
    });
  }

  if (content.socialLinks.length) {
    sources.push({
      id: "social-links",
      title: "Professional profiles",
      href: "/contact",
      text: content.socialLinks
        .map((link) => `${link.label}: ${link.url}`)
        .join("\n"),
    });
  }

  return sources;
}

function selectSources(sources: PortfolioSource[], question: string) {
  const terms = new Set(
    question
      .toLowerCase()
      .split(/[^a-z0-9+#.]+/)
      .filter((term) => term.length >= 3),
  );
  const ranked = sources
    .map((source, index) => {
      const title = source.title.toLowerCase();
      const text = source.text.toLowerCase();
      const score = [...terms].reduce(
        (total, term) =>
          total +
          (title.includes(term) ? 4 : 0) +
          (text.includes(term) ? 1 : 0),
        source.id === "profile" ? 1 : 0,
      );
      return { source, score, index };
    })
    .sort(
      (left, right) => right.score - left.score || left.index - right.index,
    );

  const matching = ranked.filter((item) => item.score > 0).slice(0, 7);
  return (matching.length ? matching : ranked.slice(0, 7)).map(
    (item) => item.source,
  );
}
