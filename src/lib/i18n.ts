export type Locale = "en" | "ta";

type Copy = Record<Locale, string>;

export const defaultLocale: Locale = "en";

export const copy = {
  appName: { en: "Victus Training School", ta: "விக்டஸ் டிரெயினிங் ஸ்கூல்" },
  partnership: {
    en: "Navvi Corporations × Victus Apparel Pvt Ltd, Sivagangai Unit.",
    ta: "நவ்வி கார்ப்பரேஷன்ஸ் × விக்டஸ் அப்பேரல் பிரைவேட் லிமிடெட், சிவகங்கை யூனிட்.",
  },
  phaseBadge: { en: "Phase 0 pilot scaffold", ta: "Phase 0 பைலட் தொடக்கம்" },
  heroTitle: {
    en: "Mobile-first operator training pilot",
    ta: "மொபைலில் சுலபமான ஆபரேட்டர் டிரெயினிங் பைலட்",
  },
  heroBody: {
    en: "Supabase Free-tier Auth and Postgres, Netlify Free deployment compatibility, role-gated routing, and the Navvi × Victus brand shell are in place before Phase 1 master-data screens begin.",
    ta: "Supabase Free-tier Auth/Postgres, Netlify Free deploy பொருத்தம், role படி routes, Navvi × Victus பிராண்ட் shell எல்லாம் Phase 1 master-data screen முன்னாடி ரெடி.",
  },

  supabaseWiredTitle: { en: "Supabase wired", ta: "Supabase இணைப்பு ரெடி" },
  supabaseWiredBody: {
    en: "Environment-based clients for browser and server auth.",
    ta: "Browser, server auth காக environment-based clients ரெடி.",
  },
  roleGatesTitle: { en: "Role gates", ta: "Role gates" },
  roleGatesBody: {
    en: "School trainers, leadership, IT, coordinator, OJT, LPI, and mechanic routes previewed.",
    ta: "School trainer, leadership, IT, coordinator, OJT, LPI, mechanic routes preview பண்ணலாம்.",
  },
  ronnySeedTitle: { en: "RONNY seed", ta: "RONNY seed data" },
  ronnySeedBody: {
    en: "Machine allowances plus only the three locked SMVs are seeded.",
    ta: "Machine allowances மற்றும் மூன்று locked SMV மட்டும் seed பண்ணியிருக்கோம்.",
  },
  phaseZero: { en: "Phase 0", ta: "Phase 0" },
  login: { en: "Login", ta: "லாகின்" },
  email: { en: "Email", ta: "மின்னஞ்சல்" },
  password: { en: "Password", ta: "கடவுச்சொல்" },
  phoneLoginNote: {
    en: "Phone login can be enabled in Supabase Auth for the pilot; this scaffold keeps email/password ready first.",
    ta: "Phone login-ஐ Supabase Auth-ல பைலட்டுக்கு ஆன் பண்ணலாம்; இப்ப email/password ரெடி பண்ணியிருக்கோம்.",
  },
  signIn: { en: "Sign in", ta: "உள்ளே போங்க" },
  signOut: { en: "Sign out", ta: "வெளியே போங்க" },
  language: { en: "Language", ta: "மொழி" },

  masterData: { en: "Master data", ta: "மாஸ்டர் டேட்டா" },
  masterDataBody: {
    en: "Manage styles, operations, steps, skill attributes, checkpoints, and Five-Loop exercises.",
    ta: "Styles, operations, steps, skill attributes, checkpoints, Five-Loop exercises எல்லாம் இங்க manage பண்ணலாம்.",
  },
  csvImport: { en: "OB CSV import", ta: "OB CSV import" },
  csvImportHelp: {
    en: "Paste RONNY OB rows with op_no, name_en, name_ta, machine_code, optional base_min, steps, checkpoints, and skill attributes.",
    ta: "op_no, name_en, name_ta, machine_code, base_min, steps, checkpoints, skill attributes உள்ள RONNY OB rows paste பண்ணுங்க.",
  },
  importCsv: { en: "Import CSV", ta: "CSV import பண்ணு" },
  csvPlaceholder: {
    en: "op_no,name_en,name_ta,machine_code,base_min\n1,Shoulder Join,ஷோல்டர் ஜோயின்,4T_OL,0.313",
    ta: "op_no,name_en,name_ta,machine_code,base_min\n1,Shoulder Join,ஷோல்டர் ஜோயின்,4T_OL,0.313",
  },
  pendingImport: { en: "SMV pending import", ta: "SMV இன்னும் import ஆகல" },
  lockedSmv: { en: "Locked SMV", ta: "Locked SMV" },
  styles: { en: "Styles", ta: "Styles" },
  operations: { en: "Operations", ta: "Operations" },
  operationSteps: { en: "Operation steps", ta: "Operation steps" },
  skillAttributes: { en: "Skill attributes", ta: "Skill attributes" },
  qualityCheckpoints: { en: "Quality checkpoints", ta: "Quality checkpoints" },
  fiveLoops: { en: "Five-Loop exercises", ta: "Five-Loop பயிற்சிகள்" },
  phaseOneReady: { en: "Phase 1 ready", ta: "Phase 1 ரெடி" },
  operation: { en: "Operation", ta: "Operation" },
  machine: { en: "Machine", ta: "Machine" },
  smv: { en: "SMV", ta: "SMV" },
  sam: { en: "SAM", ta: "SAM" },
  status: { en: "Status", ta: "நிலை" },
  target: { en: "Target", ta: "Target" },
  unit: { en: "Unit", ta: "Unit" },
  description: { en: "Description", ta: "விளக்கம்" },
  sampleCsv: { en: "Use sample CSV", ta: "Sample CSV பயன்படுத்து" },
  readOnlyMasterData: {
    en: "All authenticated roles can read OB data; coordinator and IT can write through RLS.",
    ta: "Authenticated roles எல்லாரும் OB data பார்க்கலாம்; coordinator மற்றும் IT மட்டும் RLS வழியாக எழுதலாம்.",
  },
  imported: { en: "Import complete", ta: "Import முடிந்தது" },
  writeRestricted: {
    en: "CSV import is available after login for coordinator and IT roles.",
    ta: "CSV import coordinator மற்றும் IT roles login பண்ணின பிறகு கிடைக்கும்.",
  },
  operationCount: { en: "Operations", ta: "Operations" },
  lockedCount: { en: "Locked SMVs", ta: "Locked SMVs" },
  pendingCount: { en: "Pending imports", ta: "Pending imports" },
  dashboard: { en: "Dashboard", ta: "டாஷ்போர்டு" },
  timeStudy: { en: "Time-study", ta: "டைம் ஸ்டடி" },
  panels: { en: "Panels", ta: "பேனல்கள்" },
  batch: { en: "My batch", ta: "என் பேட்ச்" },
  leadershipDashboards: { en: "Leadership dashboards", ta: "லீடர்ஷிப் டாஷ்போர்டு" },
  comingSoon: { en: "Coming in a later phase", ta: "அடுத்த phase-ல வரும்" },
  roleGate: { en: "Role-gated access", ta: "Role படி அணுகல்" },
  noSupabase: {
    en: "Add Supabase environment variables to enable live login.",
    ta: "Live login வர Supabase environment variables சேர்க்கணும்.",
  },
  demoRole: { en: "Preview as role", ta: "Role மாதிரி பார்க்க" },
  school_trainer: { en: "School Trainer", ta: "ஸ்கூல் டிரெயினர்" },
  ojt_coach: { en: "OJT Coach", ta: "OJT கோச்" },
  lpi_coach: { en: "LPI Coach", ta: "LPI கோச்" },
  mechanic: { en: "Mechanic", ta: "மெக்கானிக்" },
  coordinator: { en: "Coordinator", ta: "கோஆர்டினேட்டர்" },
  it: { en: "IT Admin", ta: "IT அட்மின்" },
  leadership: { en: "Leadership", ta: "லீடர்ஷிப்" },
} satisfies Record<string, Copy>;

export type CopyKey = keyof typeof copy;

export function t(key: CopyKey, locale: Locale): string {
  return copy[key][locale];
}
