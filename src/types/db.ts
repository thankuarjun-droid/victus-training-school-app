import type { StaffRole } from "@/lib/roles";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type MachineCode = "SNLS" | "4T_OL" | "F_LTR" | "F_LFO" | "F_LCB";

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

type MachineTypeRow = {
  id: string;
  code: MachineCode;
  name: string;
  allowance_multiplier: number;
};

type StyleRow = {
  id: string;
  code: string;
  name: string;
  garment_type: string | null;
  size: string | null;
  gsd_ob_ratio: number | null;
  created_at: string | null;
};

type OperationRow = {
  id: string;
  style_id: string | null;
  op_no: number;
  name_en: string;
  name_ta: string;
  machine_type_id: string | null;
  smv_min: number | null;
  sam_min: number | null;
  is_critical: string | null;
  sequence: number | null;
};

type OperationStepRow = {
  id: string;
  operation_id: string | null;
  step_no: number;
  description_en: string | null;
  description_ta: string | null;
  instruction_en: string | null;
  instruction_ta: string | null;
};

type OperationSkillAttrRow = {
  id: string;
  operation_id: string | null;
  attr_key: string;
  attr_value: string | null;
  exercise_stage: number | null;
};

type QualityCheckpointRow = {
  id: string;
  operation_id: string | null;
  checkpoint_no: number;
  description_en: string;
  description_ta: string;
  check_method: string | null;
  tolerance: string | null;
};

type LoopRow = {
  id: string;
  loop_no: number;
  name_en: string;
  name_ta: string;
  description_en: string | null;
  description_ta: string | null;
  target_value: number | null;
  target_unit: string | null;
};

type StaffUpdate = Partial<StaffInsert>;
type MachineTypeInsert = { id?: string; code: MachineCode; name: string; allowance_multiplier: number };
type StyleInsert = {
  id?: string;
  code: string;
  name: string;
  garment_type?: string | null;
  size?: string | null;
  gsd_ob_ratio?: number | null;
  created_at?: string | null;
};
type OperationInsert = {
  id?: string;
  style_id?: string | null;
  op_no: number;
  name_en: string;
  name_ta: string;
  machine_type_id?: string | null;
  smv_min?: number | null;
  sam_min?: number | null;
  is_critical?: string | null;
  sequence?: number | null;
};
type OperationStepInsert = {
  id?: string;
  operation_id?: string | null;
  step_no: number;
  description_en?: string | null;
  description_ta?: string | null;
  instruction_en?: string | null;
  instruction_ta?: string | null;
};
type OperationSkillAttrInsert = {
  id?: string;
  operation_id?: string | null;
  attr_key: string;
  attr_value?: string | null;
  exercise_stage?: number | null;
};
type QualityCheckpointInsert = {
  id?: string;
  operation_id?: string | null;
  checkpoint_no: number;
  description_en: string;
  description_ta: string;
  check_method?: string | null;
  tolerance?: string | null;
};
type LoopInsert = {
  id?: string;
  loop_no: number;
  name_en: string;
  name_ta: string;
  description_en?: string | null;
  description_ta?: string | null;
  target_value?: number | null;
  target_unit?: string | null;
};

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      staff: Table<StaffRow, StaffInsert, StaffUpdate>;
      machine_types: Table<MachineTypeRow, MachineTypeInsert>;
      styles: Table<StyleRow, StyleInsert>;
      operations: Table<OperationRow, OperationInsert>;
      operation_steps: Table<OperationStepRow, OperationStepInsert>;
      operation_skill_attrs: Table<OperationSkillAttrRow, OperationSkillAttrInsert>;
      quality_checkpoints: Table<QualityCheckpointRow, QualityCheckpointInsert>;
      loops: Table<LoopRow, LoopInsert>;
    };
    Views: Record<string, never>;
    Functions: {
      current_staff_role: { Args: Record<string, never>; Returns: StaffRole | null };
      current_staff_id: { Args: Record<string, never>; Returns: string | null };
    };
    Enums: {
      staff_role: StaffRole;
      machine_code: MachineCode;
    };
    CompositeTypes: Record<string, never>;
  };
};
