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
  allowDuringMaintenance = false,
  clientIdentifier,
  history,
  question,
}: {
  allowDuringMaintenance?: boolean;
  clientIdentifier: string;
  history: ChatHistoryMessage[];
  question: string;
}): Promise<ChatAnswer> {
  if (!portfolioChatIsAvailable()) {
    throw new ChatUnavailableError("Portfolio chat is not configured.");
  }

  const safeResponse = getSafeResponse(question);
  if (safeResponse) return safeResponse;

  const quota = await consumeChatQuota(clientIdentifier);
  if (!quota.allowed) throw new ChatRateLimitError(quota.retryAfterSeconds);

  const content = await getPublicChatContent();
  if (content.settings?.maintenanceMode && !allowDuringMaintenance) {
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
        richTextToPlainText(experience.richDescription),
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

  return sources;
}

function getSafeResponse(question: string): ChatAnswer | null {
  const normalized = question.trim().toLowerCase();
  const personalDataPattern =
    /\b(e-?mail|phone|mobile|telephone|whats-?app|address|location|contact details?|contact information|private account|password|credential|secret|api key|where (?:does|is) (?:he|minhazul) live)\b|\b[^\s@]+@[^\s@]+\.[^\s@]+\b|(?:\+?\d[\d\s().-]{7,}\d)/i;

  if (personalDataPattern.test(normalized)) {
    return {
      answer:
        "I protect Minhazul's personal information, so I cannot provide email addresses, phone numbers, messaging handles, addresses, credentials, or other private details. For a professional inquiry, please use the portfolio contact form.",
      sources: [
        { title: "Professional contact channel", href: "/#contact-overview" },
      ],
    };
  }

  if (
    /\b(how (?:can|do|should) i (?:contact|reach|get in touch with)|contact|minhazul for (?:work|a project|a role|business)|hire)\b/i.test(
      normalized,
    )
  ) {
    return {
      answer:
        "For a professional conversation with Minhazul, please use the portfolio contact form on the home page. It is the appropriate channel for project, role, and collaboration inquiries.",
      sources: [
        { title: "Professional contact channel", href: "/#contact-overview" },
      ],
    };
  }

  if (
    /^(hi|hello|hey|hiya|greetings|good (morning|afternoon|evening))[!. ]*$/i.test(
      normalized,
    )
  ) {
    return {
      answer:
        "Hello and welcome. You are connected to Minhaz's Personal Chatbot Assistant, your guide to Minhazul's professional portfolio.",
      sources: [],
    };
  }

  if (
    /^(thanks|thank you|thankyou|much appreciated)[!. ]*$/i.test(normalized)
  ) {
    return {
      answer:
        "You are welcome. I am here whenever you want to continue exploring Minhazul's professional work.",
      sources: [],
    };
  }

  if (/^(bye|goodbye|see you|take care)[!. ]*$/i.test(normalized)) {
    return {
      answer:
        "Goodbye, and thank you for visiting Minhazul's portfolio. Have a great day.",
      sources: [],
    };
  }

  return null;
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
