/*
 * Cape Island Recovery — public site configuration (edit here, nowhere else).
 * The Supabase URL and publishable key are PUBLIC by design: security is enforced by
 * Row Level Security in supabase/schema.sql. NEVER put a service_role / secret key here.
 */
window.CIR_CONFIG = {
  SUPABASE_URL: "https://oiousqgzqcjanikglkxl.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_IJHa5taHcttV2DSZq45fWQ_bVbRDbA2", // publishable key (safe to publish)
  SUPABASE_SCHEMA: "cape_island_recovery", // this site's own schema in the shared "james-sites" project
  CONTACT_EMAIL: "roottorisema@gmail.com",  // TODO: switch to info@capeisland.org once it exists
  PHONE: "603-721-2088",
  DONATE_URL: "https://linktr.ee/roottorisema" // TODO: switch to the Zeffy page once it exists
};
