import type { ExperienceSeedData } from "@/data/seed/types";

export const experienceSeedData: readonly ExperienceSeedData[] = [
  {
    company: "eGeneration PLC",
    position: "Software Engineer (Full-stack)",
    location:
      "Ranks Business Center Level 9, Ka 218/1, Pragati Sarani, Kuril, Dhaka 1229",
    startDate: "2024-12-01",
    currentlyWorking: true,
    richDescription: richText(
      "Designs and develops AI-powered, enterprise, microservice, and monolithic applications using Java, Spring Boot, Angular, distributed-system patterns, and modern AI tooling.",
    ),
    achievements: [
      "Design and develop AI-powered chatbots and multipurpose enterprise solutions using Spring AI, Large Language Models, Retrieval-Augmented Generation, vector databases, embeddings, and structured AI outputs.",
      "Implement AI orchestration workflows that coordinate language models, business services, knowledge sources, APIs, tools, and automated processes to deliver reliable and context-aware AI solutions.",
      "Develop and maintain full-stack microservice and monolithic applications using Spring Boot, Angular, and Java, improving performance and user experience.",
      "Design event-driven and asynchronous systems using Apache Kafka, RabbitMQ, CQRS, and distributed application patterns.",
      "Refactor legacy applications using modern architectural approaches, resolve critical production issues, and introduce maintainable solutions that support long-term system growth.",
      "Improve application performance through caching, optimized JPA and Hibernate queries, database indexing, pagination, and efficient processing of large datasets using Spring Batch.",
      "Design and implement enterprise reporting solutions using JasperReports to support operational monitoring and data-driven decision-making.",
      "Participate in system design, requirement analysis, API design, database modeling, deployment, and production support activities.",
      "Implement Spring Profiles for flexible, environment-specific initialization.",
      "Mentor junior developers, conduct code reviews, troubleshoot technical challenges, and promote clean code, maintainable architecture, and software engineering best practices.",
    ],
    technologies: [
      "Java",
      "Spring Boot",
      "Angular",
      "Spring AI",
      "Large Language Models",
      "Retrieval-Augmented Generation",
      "Vector Databases",
      "Embeddings",
      "Apache Kafka",
      "RabbitMQ",
      "CQRS",
      "Spring Data JPA",
      "Hibernate",
      "Spring Batch",
      "JasperReports",
    ],
    featured: true,
  },
  {
    company: "Simec System Ltd.",
    position: "Junior Software Engineer (Backend)",
    location:
      "House - 55, Level-5, Shah Mokhdum Avenue, Sector-12, Uttara 1230 Dhaka",
    startDate: "2022-06-01",
    endDate: "2024-12-01",
    currentlyWorking: false,
    richDescription: richText(
      "Developed and maintained secure Java and Spring Boot backend microservices using CQRS, event-driven architecture, asynchronous messaging, and production-focused database optimization.",
    ),
    achievements: [
      "Developed and maintained backend microservices using Java, Spring Boot, Spring Cloud, and Axon Framework, applying CQRS and event-driven architectural patterns.",
      "Implemented authentication and role-based authorization using Spring Security and JWT to secure REST APIs and restrict system features based on roles and permissions.",
      "Integrated RabbitMQ for asynchronous communication, background processing, and notification delivery between distributed services.",
      "Designed and implemented RESTful and event-driven APIs following Clean Architecture, SOLID principles, and standard API design practices.",
      "Developed advanced search, dynamic filtering, pagination, and sorting features using Spring Data JPA, Specifications, and QueryDSL.",
      "Assisted in database schema design, indexing strategies, and high-volume transactional optimizations.",
      "Investigated and resolved production issues through application log analysis, SQL query tuning, debugging, and service stabilization.",
      "Collaborated with frontend developers, QA engineers, and other stakeholders to maintain API contract consistency, resolve integration issues, and support smooth releases.",
    ],
    technologies: [
      "Java",
      "Spring Boot",
      "Spring Cloud",
      "Axon Framework",
      "CQRS",
      "Spring Security",
      "JWT",
      "RabbitMQ",
      "RESTful APIs",
      "Spring Data JPA",
      "QueryDSL",
    ],
    featured: true,
  },
];

function richText(text: string) {
  return {
    root: {
      type: "root" as const,
      version: 1 as const,
      direction: null,
      format: "",
      indent: 0,
      children: [
        {
          type: "paragraph" as const,
          version: 1 as const,
          direction: null,
          format: "",
          indent: 0,
          textFormat: 0,
          textStyle: "",
          children: [
            {
              type: "text" as const,
              version: 1 as const,
              detail: 0,
              format: 0,
              mode: "normal",
              style: "",
              text,
            },
          ],
        },
      ],
    },
  };
}
