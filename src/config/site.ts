import { env } from "@/config/env";

export const siteConfig = {
  name: "Minhazul Islam",
  description:
    "Full-stack Java developer building robust and scalable software with Java, Spring Boot, Angular, microservices, distributed systems, and AI integrations.",
  url: env.NEXT_PUBLIC_SITE_URL,
} as const;
