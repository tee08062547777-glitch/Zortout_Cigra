import categoriesJson from "@/app/dashboard/categories.json";

export interface Category {
  id: string;
  label: string;
  icon: string;
  keywords: string[];
}

interface CategoryJsonValue {
  id: string;
  label: string;
  icon: string;
  keywords: string[];
}

export const fallbackCategories = Object.values(
  categoriesJson,
) as CategoryJsonValue[] as Category[];

export function createCategoryId(label: string) {
  const normalized = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9ก-๙]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || `category-${Date.now()}`;
}
