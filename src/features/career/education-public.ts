export const EDUCATION_DEGREE_PLACEHOLDER = "needs confirmation";

export function isEducationDegreePlaceholder(degree: string) {
  return degree.trim().toLowerCase() === EDUCATION_DEGREE_PLACEHOLDER;
}
