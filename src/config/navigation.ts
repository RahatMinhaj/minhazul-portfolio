export type PublicNavigationItem = {
  label: string;
  href: string;
  primary?: boolean;
  feature?: "blog" | "contact" | "playground";
};

export const publicNavigation: readonly PublicNavigationItem[] = [
  { label: "Home", href: "/", primary: true },
  { label: "Projects", href: "/projects", primary: true },
  { label: "Experience", href: "/experience", primary: true },
  { label: "Skills", href: "/skills", primary: true },
  { label: "About", href: "/about", primary: true },
  { label: "Writing", href: "/blog", feature: "blog" },
  { label: "Education", href: "/education" },
  { label: "Certifications", href: "/certifications" },
  { label: "Uses", href: "/uses" },
  { label: "Playground", href: "/playground", feature: "playground" },
  { label: "Contact", href: "/contact", primary: true, feature: "contact" },
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
