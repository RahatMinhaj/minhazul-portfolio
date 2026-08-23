export type PublicNavigationItem = {
  label: string;
  href: string;
  landingHref?: string;
  primary?: boolean;
  feature?: "blog" | "contact" | "playground";
};

export const publicNavigation: readonly PublicNavigationItem[] = [
  { label: "Home", href: "/", landingHref: "/#main-content", primary: true },
  {
    label: "Projects",
    href: "/projects",
    landingHref: "/#work-overview",
    primary: true,
  },
  {
    label: "Experience",
    href: "/experience",
    landingHref: "/#experience-overview",
    primary: true,
  },
  {
    label: "Skills",
    href: "/skills",
    landingHref: "/#capabilities",
    primary: true,
  },
  {
    label: "About",
    href: "/about",
    landingHref: "/#about-overview",
    primary: true,
  },
  {
    label: "Writing",
    href: "/blog",
    landingHref: "/#explore-overview",
    feature: "blog",
  },
  {
    label: "Education",
    href: "/education",
    landingHref: "/#credentials-overview",
  },
  {
    label: "Certifications",
    href: "/certifications",
    landingHref: "/#certifications-overview",
  },
  { label: "Uses", href: "/uses", landingHref: "/#explore-overview" },
  {
    label: "Playground",
    href: "/playground",
    landingHref: "/#explore-overview",
    feature: "playground",
  },
  {
    label: "Contact",
    href: "/#contact-overview",
    landingHref: "/#contact-overview",
    primary: true,
    feature: "contact",
  },
];

export function getPublicNavigation(
  settings?: {
    blogEnabled?: boolean;
    contactEnabled?: boolean;
    playgroundEnabled?: boolean;
  } | null,
) {
  return publicNavigation.filter((item) => {
    if (item.feature === "blog") return settings?.blogEnabled !== false;
    if (item.feature === "contact") return settings?.contactEnabled !== false;
    if (item.feature === "playground") {
      return settings?.playgroundEnabled !== false;
    }
    return true;
  });
}
