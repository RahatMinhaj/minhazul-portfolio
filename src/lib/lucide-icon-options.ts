import {
  Award,
  BadgeCheck,
  BookOpen,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  Cloud,
  Code2,
  Container,
  Database,
  Globe2,
  GraduationCap,
  ImageIcon,
  Link2,
  Mail,
  MessageCircle,
  Network,
  PanelsTopLeft,
  Send,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  UserRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export const lucideIconOptions: ReadonlyArray<{
  key: string;
  label: string;
  icon: LucideIcon;
}> = [
  { key: "award", label: "Award", icon: Award },
  { key: "badge-check", label: "Badge check", icon: BadgeCheck },
  { key: "book-open", label: "Book", icon: BookOpen },
  { key: "brain-circuit", label: "AI / Brain circuit", icon: BrainCircuit },
  { key: "briefcase", label: "Briefcase", icon: BriefcaseBusiness },
  { key: "building", label: "Building", icon: Building2 },
  { key: "cloud", label: "Cloud", icon: Cloud },
  { key: "code", label: "Code", icon: Code2 },
  { key: "container", label: "Container", icon: Container },
  { key: "database", label: "Database", icon: Database },
  { key: "globe", label: "Globe", icon: Globe2 },
  { key: "graduation-cap", label: "Graduation", icon: GraduationCap },
  { key: "image", label: "Image", icon: ImageIcon },
  { key: "link", label: "Link", icon: Link2 },
  { key: "mail", label: "Email", icon: Mail },
  { key: "message-circle", label: "Message", icon: MessageCircle },
  { key: "network", label: "Network", icon: Network },
  { key: "panels-top-left", label: "Frontend panels", icon: PanelsTopLeft },
  { key: "send", label: "Send", icon: Send },
  { key: "server", label: "Server", icon: Server },
  { key: "shield-check", label: "Security", icon: ShieldCheck },
  { key: "sparkles", label: "Sparkles", icon: Sparkles },
  { key: "terminal", label: "Terminal", icon: Terminal },
  { key: "user", label: "User", icon: UserRound },
  { key: "wrench", label: "Tools", icon: Wrench },
];

export function getLucideIcon(value: string | null | undefined) {
  const key = value?.startsWith("lucide:") ? value.slice(7) : value;
  return lucideIconOptions.find((option) => option.key === key)?.icon ?? null;
}
