import type { EducationSeedData } from "@/data/seed/types";

export const educationSeedData: readonly EducationSeedData[] = [
  {
    institution: "Jahangirnagar University",
    degree: "Post Graduate Diploma in IT (PGDIT)",
    field: "Information Technology",
    description: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Modules covered include Artificial Intelligence and Neural Network, Network Security, Software Engineering, Ethical Hacking, Network Defense and Auditing, Computer Network Design, Web Programming, Database Management Systems, Introduction to IT and Programming, Computer Programming Environment, and E-commerce.",
            },
          ],
        },
      ],
    },
  },
  {
    institution: "IsDB-BISEW IT Scholarship Program",
    degree: "Diploma in Enterprise Systems Analysis and Design - JEE",
    field: "Enterprise Systems Analysis and Design",
    description: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Modules covered include Spring, Spring Boot, object-oriented programming using Java, Angular, server-side programming using Servlet, JSP, JSF and Hibernate, web publishing, object-oriented system analysis and design using UML, JasperReports, and databases.",
            },
          ],
        },
      ],
    },
  },
  {
    institution:
      "Kabi Nazrul Govt. College (Affiliated with University of Dhaka)",
    degree: "Needs confirmation",
    field: "English",
  },
];
