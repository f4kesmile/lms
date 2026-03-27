export type AuthEmailMode = "restricted" | "public";

const DEFAULT_AUTH_EMAIL_MODE: AuthEmailMode = "restricted";

function normalizeDomain(value: string): string {
  return value.trim().toLowerCase();
}

export function getAllowedEmailDomains(): string[] {
  const raw = process.env.AUTH_ALLOWED_EMAIL_DOMAINS;
  if (!raw) return [];

  return raw
    .split(",")
    .map(normalizeDomain)
    .filter(Boolean);
}

export function getAuthEmailMode(): AuthEmailMode {
  const raw = process.env.AUTH_EMAIL_MODE?.trim().toLowerCase();
  if (raw === "public") return "public";
  return DEFAULT_AUTH_EMAIL_MODE;
}

export function isDomainRestrictionEnabled(): boolean {
  return getAuthEmailMode() === "restricted";
}

export function getAllowedEmailDomainsText(): string {
  const domains = getAllowedEmailDomains();
  return domains.length > 0 ? domains.join(", ") : "(belum diatur)";
}

export function isAllowedEmail(email: string): boolean {
  if (!isDomainRestrictionEnabled()) {
    return true;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const atIndex = normalizedEmail.lastIndexOf("@");
  if (atIndex <= 0) return false;

  const domain = normalizedEmail.slice(atIndex + 1);
  const allowedDomains = getAllowedEmailDomains();
  if (allowedDomains.length === 0) return false;
  return allowedDomains.includes(domain);
}
