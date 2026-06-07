/**
 * Converts camelCase / PascalCase / space-separated header names to snake_case.
 * Examples:
 *   orderID     → order_id
 *   customerID  → customer_id
 *   nItems      → n_items
 *   Order Date  → order_date
 */
export function normalizeColName(h) {
  return h
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2") // orderID → order_ID
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2") // HTMLParser → HTML_Parser
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
}

/**
 * Coerces a raw CSV string value to match the expected Postgres column type.
 *
 * - numeric/decimal: strips non-numeric characters → returns null if unparseable
 * - integer:         same but floors to integer
 * - everything else: returned as-is (Postgres handles casting for text, timestamps, etc.)
 *
 * This handles corrupted values like "Dez 99" or "Nov 99" that Excel sometimes
 * generates when formatting large numbers in non-English locales.
 */
export function coerceValue(raw, dataType) {
  if (raw === null || raw === undefined || raw === "") return null

  const numericTypes = [
    "numeric",
    "decimal",
    "real",
    "double precision",
    "money",
  ]
  const intTypes = [
    "integer",
    "bigint",
    "smallint",
    "int",
    "int2",
    "int4",
    "int8",
  ]

  if (numericTypes.some((t) => dataType?.includes(t))) {
    const cleaned = String(raw).replace(/[^0-9.\-]/g, "")
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? null : parsed
  }

  if (intTypes.some((t) => dataType?.includes(t))) {
    const cleaned = String(raw).replace(/[^0-9\-]/g, "")
    const parsed = parseInt(cleaned, 10)
    return isNaN(parsed) ? null : parsed
  }

  return raw
}
