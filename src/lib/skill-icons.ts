export const SIMPLE_ICON_PREFIX = "simple-icons:";

export function getSkillIconUrl(value: string | null | undefined) {
  if (!value) return null;
  if (value.startsWith(SIMPLE_ICON_PREFIX)) {
    const slug = value.slice(SIMPLE_ICON_PREFIX.length);
    return /^[a-z0-9]+$/.test(slug)
      ? `https://cdn.simpleicons.org/${slug}`
      : null;
  }

  return value;
}

export function getSimpleIconSlug(value: string | null | undefined) {
  return value?.startsWith(SIMPLE_ICON_PREFIX)
    ? value.slice(SIMPLE_ICON_PREFIX.length)
    : null;
}
