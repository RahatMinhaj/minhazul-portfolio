import type { SkillCategorySeedData, SkillSeedData } from "@/data/seed/types";

export const skillCategorySeedData: readonly SkillCategorySeedData[] = [
  {
    name: "Backend",
    slug: "backend",
    description:
      "Server-side development, APIs, security, persistence, reporting, and build tooling.",
    icon: "server",
  },
  {
    name: "Microservices & Architecture",
    slug: "microservices-architecture",
    description:
      "Distributed-system communication, coordination, and architectural patterns.",
    icon: "network",
  },
  {
    name: "Frontend",
    slug: "frontend",
    description:
      "Web and desktop interface technologies used across full-stack applications.",
    icon: "panels-top-left",
  },
  {
    name: "Database",
    slug: "database",
    description:
      "Relational, document, vector, caching, and database-programming technologies.",
    icon: "database",
  },
  {
    name: "AI",
    slug: "ai",
    description:
      "AI application development, orchestration, retrieval, models, and assistants.",
    icon: "brain-circuit",
  },
  {
    name: "Cloud & DevOps",
    slug: "cloud-devops",
    description: "Containerized development and deployment tooling.",
    icon: "container",
  },
  {
    name: "Tools & Delivery",
    slug: "tools-delivery",
    description:
      "Version control, collaboration, project delivery, IDEs, and API tooling.",
    icon: "wrench",
  },
];

const skillGroups: Readonly<Record<string, readonly string[]>> = {
  Backend: [
    "Java",
    "Spring Boot",
    "Spring Security",
    "Spring MVC",
    "Spring Batch",
    "Spring AOP",
    "Spring Data JPA",
    "Hibernate",
    "JasperReports",
    "JWT",
    "OAuth2",
    "RESTful APIs",
    "JSON",
    "XML",
    "Maven",
    "Gradle",
    "QueryDSL",
    "Apache POI",
  ],
  "Microservices & Architecture": [
    "Microservices",
    "Spring Cloud",
    "OpenFeign",
    "RestClient",
    "RestTemplate",
    "API Gateway",
    "Service Discovery",
    "CQRS",
    "Event-Driven Architecture",
    "Event Sourcing",
    "Axon Framework",
    "Apache Kafka",
    "RabbitMQ",
    "Clean Architecture",
    "SOLID",
  ],
  Frontend: [
    "Angular",
    "React",
    "TypeScript",
    "JavaScript",
    "Java Swing",
    "Bootstrap",
    "HTML",
    "CSS",
  ],
  Database: [
    "Redis",
    "Oracle",
    "MySQL",
    "PostgreSQL",
    "MongoDB",
    "Vector Databases",
    "PL/SQL",
  ],
  AI: [
    "Spring AI",
    "Retrieval-Augmented Generation",
    "Embeddings",
    "LLM Integration",
    "AI Agents",
    "Structured Output",
    "n8n",
    "ChatGPT",
    "Claude",
    "Cursor",
    "Google Antigravity",
  ],
  "Cloud & DevOps": ["Docker"],
  "Tools & Delivery": [
    "Git",
    "GitHub",
    "GitLab",
    "Jira",
    "Redmine",
    "Agile",
    "Scrum",
    "IntelliJ IDEA",
    "NetBeans",
    "Spring Tool Suite",
    "VS Code",
    "Postman",
  ],
};

const highlightedSkills = new Set([
  "Java",
  "Spring Boot",
  "Angular",
  "Microservices",
  "Spring AI",
  "Apache Kafka",
]);

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const skillSeedData: readonly SkillSeedData[] = Object.entries(
  skillGroups,
).flatMap(([category, skills]) =>
  skills.map((name) => ({
    name,
    slug: toSlug(name),
    category,
    highlighted: highlightedSkills.has(name),
  })),
);
