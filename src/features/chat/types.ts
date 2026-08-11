export type ChatHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

export type PortfolioSource = {
  id: string;
  title: string;
  href: string;
  text: string;
};

export type ChatAnswer = {
  answer: string;
  sources: Array<{ title: string; href: string }>;
};
