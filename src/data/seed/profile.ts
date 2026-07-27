import type { ProfileSeedData } from "@/data/seed/types";

export const profileSeedData: ProfileSeedData = {
  fullName: "Minhazul Islam",
  professionalTitle: "Full Stack Java Developer",
  shortBio:
    "Full-stack Java developer building robust, scalable, and intuitive software with Java, Spring Boot, Angular, microservices, distributed systems, and AI integrations.",
  longBio: {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "I believe that every problem is an opportunity to innovate. My goal is to design and build software solutions that are not only robust and scalable but also intuitive and forward-thinking.",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "With hands-on experience in Java, Spring Boot, Angular, microservices, and distributed systems, I take pride in solving real-world problems with creative and practical solutions.",
          },
        ],
      },
    ],
  },
  email: "talktominhaz@gmail.com",
  phone: "+8801410466644 / +8801521580501",
  availabilityStatus: "Currently employed",
  currentCompany: "eGeneration PLC",
  currentRole: "Software Engineer (Full-stack)",
  currentFocus:
    "AI-powered chatbots, enterprise applications, microservices, distributed systems, performance optimization, and production support.",
  learningGoals: [],
  engineeringValues: [
    "Robust and scalable systems",
    "Clean and maintainable architecture",
    "Creative and practical problem-solving",
    "Software engineering best practices",
  ],
};
