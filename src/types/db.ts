import type { StaffRole } from "@/lib/roles";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type StaffRow = {
  id: string;
  auth_uid: string | null;
  name: string;
  phone: string | null;
  role: StaffRole;
  active: boolean | null;
};

type StaffInsert = {
  id?: string;
  auth_uid?: string | null;
  name: string;
  phone?: string | null;
  role: StaffRole;
  active?: boolean | null;
};

type StaffUpdate = Partial<StaffInsert>;

export type Database = {
  public: {
    Tables: {
      staff: {
        Row: StaffRow;
        Insert: StaffInsert;
        Update: StaffUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_staff_role: { Args: Record<string, never>; Returns: StaffRole | null };
      current_staff_id: { Args: Record<string, never>; Returns: string | null };
    };
    Enums: {
      staff_role: StaffRole;
      machine_code: "SNLS" | "4T_OL" | "F_LTR" | "F_LFO" | "F_LCB";
    };
    CompositeTypes: Record<string, never>;
  };
};
