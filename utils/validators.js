export function isDigitsOnly(value) {
  if (value === undefined || value === null) return false;
  const str = String(value).trim();
  return str.length > 0 && /^[0-9]+$/.test(str);
}

export function isIntegerValue(value) {
  if (value === undefined || value === null || String(value).trim() === '') return false;
  const str = String(value).trim();
  return /^-?\d+$/.test(str);
}

export function isPositiveInteger(value) {
  return isIntegerValue(value) && Number(value) > 0;
}

export function isNonNegativeInteger(value) {
  return isIntegerValue(value) && Number(value) >= 0;
}

export function isNumberValue(value) {
  if (value === undefined || value === null || String(value).trim() === '') return false;
  const str = String(value).trim();
  return /^-?\d+(\.\d+)?$/.test(str);
}

export function isPositiveNumber(value) {
  return isNumberValue(value) && Number(value) > 0;
}

export function isNonNegativeNumber(value) {
  return isNumberValue(value) && Number(value) >= 0;
}

export function parseNumber(value) {
  if (!isNumberValue(value)) return null;
  return Number(String(value).trim());
}

export function parseInteger(value) {
  if (!isIntegerValue(value)) return null;
  return Number(String(value).trim());
}
