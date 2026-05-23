import crypto from "node:crypto";

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const CATEGORY_PREFIXES = {
  electronics: "ELEC",
  clothing: "APRL",
  food: "FOOD",
  beverages: "BEVR",
  furniture: "FURN",
  office: "OFFC",
  sports: "SPRT",
  toys: "TOYS",
  books: "BOOK",
  automotive: "AUTO",
  health: "HLTH",
  beauty: "BEAU",
  tools: "TOOL",
  garden: "GRDN",
  pets: "PETS",
};

function randomString(length) {
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CHARSET[bytes[i] % CHARSET.length];
  }
  return result;
}

function getCategoryPrefix(category) {
  if (!category) return null;
  const key = category.trim().toLowerCase();
  return CATEGORY_PREFIXES[key] || key.slice(0, 4).toUpperCase();
}

function abbreviate(name, len = 4) {
  return name
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .map((w) => w.charAt(0) || "")
    .join("")
    .toUpperCase()
    .slice(0, len)
    .padEnd(len, "X");
}

export async function generateSKU(options = {}) {
  const {
    category,
    name,
    prefix = "SKU",
    separator = "-",
    length = 6,
    includeCategory = false,
    includeName = false,
    checkUnique,
  } = options;

  const parts = [prefix];

  if (includeCategory) {
    parts.push(getCategoryPrefix(category) || "GEN");
  }
  if (includeName && name) {
    parts.push(abbreviate(name));
  }

  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const random = randomString(length);
    const sku = [...parts, random].join(separator).toUpperCase();

    if (typeof checkUnique !== "function") {
      return sku;
    }

    const isUnique = await checkUnique(sku);
    if (isUnique) return sku;
  }

  throw new Error("Failed to generate a unique SKU after maximum attempts");
}
