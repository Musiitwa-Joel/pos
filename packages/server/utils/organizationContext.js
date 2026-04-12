import { db } from "../config/config.js";
import { ensureGeneralSettingsStructure } from "../schema/global_settings/utils.js";

const CACHE_TTL_MS = Number(
  process.env.ORGANIZATION_CONTEXT_CACHE_TTL || 60_000
);

let cachedContext = null;
let cacheTimestamp = 0;

export const invalidateOrganizationContextCache = () => {
  cachedContext = null;
  cacheTimestamp = 0;
};

export const loadOrganizationContext = async (forceRefresh = false) => {
  const now = Date.now();
  if (!forceRefresh && cachedContext && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedContext;
  }

  await ensureGeneralSettingsStructure();

  const [generalRows] = await db.execute(
    `SELECT
        organization_name,
        organization_phone,
        organization_phone_alt,
        organization_email,
        website_url,
        careers_portal_url,
        linkedin_url,
        twitter_url,
        facebook_url,
        instagram_url,
        hr_contact_name,
        hr_contact_title,
        hr_contact_email,
        hr_contact_phone,
        default_contract_duration,
        default_probation_period,
        default_notice_period
      FROM general_settings
      WHERE deleted = 0
      ORDER BY updated_at DESC
      LIMIT 1`
  );
  const general = generalRows[0] || null;

  const [hrEmailRows] = await db.execute(
    `SELECT
        primary_email,
        recruitment_email,
        payroll_email,
        leave_email,
        notification_settings
      FROM hr_emails
      WHERE deleted = 0
      ORDER BY updated_at DESC
      LIMIT 1`
  );
  const hrEmails = hrEmailRows[0] || null;

  cachedContext = { general, hrEmails };
  cacheTimestamp = now;
  return cachedContext;
};

export default loadOrganizationContext;
