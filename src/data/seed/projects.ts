import type { ProjectSeedData } from "@/data/seed/types";

export const projectSeedData: readonly ProjectSeedData[] = [
  {
    title: "eghealth - Microservice Based Modular Hospital ERP",
    slug: "eghealth-microservice-hospital-erp",
    shortDescription:
      "A scalable and secure hospital ERP covering OPD/IPD, billing, pharmacy, inventory, laboratory, reporting, and user management, with optimized data processing and containerized deployment.",
    richDescription: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "A scalable and secure hospital ERP covering OPD/IPD, billing, pharmacy, inventory, laboratory, reporting, and user management, with optimized data processing and containerized deployment.",
            },
          ],
        },
      ],
    },
    projectType: "Hospital ERP",
    status: "COMPLETED",
    technologies: [
      "Java 17",
      "Spring Boot",
      "Spring Cloud",
      "Spring Security",
      "Microservices",
      "QueryDSL",
      "Redis",
      "JPA",
      "JWT",
      "Docker",
      "PostgreSQL",
    ],
    featured: true,
  },
  {
    title: "Labour Information Management System",
    slug: "labour-information-management-system",
    shortDescription:
      "A government enterprise system comprising 16 independent services with service discovery, centralized configuration, load balancing, secure authentication, caching, messaging, hybrid persistence, reporting, and a React frontend.",
    richDescription: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "A highly scalable microservice-based enterprise system comprising 16 independent services, featuring service discovery, centralized configuration, load balancing, secure OAuth2/JWT authentication, Redis caching, RabbitMQ messaging, hybrid Oracle–MongoDB persistence, dynamic Apache POI reporting, and a React-based frontend.",
            },
          ],
        },
      ],
    },
    projectType: "Government enterprise system",
    clientName: "Government",
    status: "COMPLETED",
    technologies: [
      "Java 17",
      "Spring Boot",
      "Spring Cloud",
      "Spring Security",
      "OAuth2",
      "JWT",
      "JPA",
      "Redis",
      "RabbitMQ",
      "Apache POI",
      "React",
      "MongoDB",
      "Oracle",
      "Docker",
    ],
    featured: true,
  },
  {
    title: "Hospital Information Management System - ERP",
    slug: "bgb-hospital-information-management-system",
    shortDescription:
      "An enterprise ERP that centralizes hospital operations across BGB healthcare facilities, including clinical workflows, pharmacy, billing, inventory, diagnostics, and electronic medical records.",
    richDescription: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "An enterprise-grade ERP system developed to automate and centralize hospital operations across BGB healthcare facilities. It covers OPD/IPD, admission and discharge, prescriptions, pharmacy, billing, inventory, diagnostics, and EMR, enabling secure and unified medical service delivery.",
            },
          ],
        },
      ],
    },
    projectType: "Hospital ERP",
    clientName: "Border Guard Bangladesh - Defence Sector",
    status: "COMPLETED",
    technologies: [
      "Java 8",
      "Angular",
      "Spring Security",
      "Spring Batch",
      "JasperReports",
      "Redis",
      "QueryDSL",
      "RabbitMQ",
      "Apache POI",
      "PostgreSQL",
      "PL/SQL",
    ],
    featured: true,
  },
  {
    title: "E-Procurement",
    slug: "dgdp-e-procurement",
    shortDescription:
      "A modular microservice e-procurement platform using CQRS and Event Sourcing, with reliable inter-service communication, distributed transaction handling, and dynamic reporting.",
    richDescription: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "A modular microservice-based e-procurement platform built using CQRS and Event Sourcing with Axon Framework. It supports reliable inter-service communication, distributed transaction handling, and dynamic report generation through Apache POI.",
            },
          ],
        },
      ],
    },
    projectType: "E-procurement platform",
    clientName: "DGDP - Defence Sector",
    status: "COMPLETED",
    technologies: [
      "Java",
      "Spring Boot",
      "JPA",
      "Axon Framework",
      "CQRS",
      "Event Sourcing",
      "Apache Kafka",
      "Apache POI",
      "Oracle",
    ],
    featured: true,
  },
];
