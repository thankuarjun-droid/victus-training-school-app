import { beforeEach, describe, expect, it, vi } from "vitest";

type MockStaffRow = {
  id: string;
  name: string;
  role: string;
};

const redirectMock = vi.hoisted(() =>
  vi.fn((path: string): never => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
);

const authState = vi.hoisted(() => ({
  user: { id: "auth-user-1" } as { id: string } | null,
  staff: null as MockStaffRow | null,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/lib/supabase", () => ({
  hasSupabaseConfig: () => true,
  createSupabaseServerClient: () => ({
    auth: {
      getUser: async () => ({ data: { user: authState.user } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: async () => ({
              data: authState.staff,
              error: authState.staff ? null : { message: "Staff record not found" },
            }),
          }),
        }),
      }),
    }),
  }),
}));

import { requireStaffRole } from "./auth";

describe("requireStaffRole", () => {
  beforeEach(() => {
    redirectMock.mockClear();
    authState.user = { id: "auth-user-1" };
    authState.staff = {
      id: "staff-1",
      name: "Leadership User",
      role: "leadership",
    };
  });

  it("returns the current staff member when the role is allowed", async () => {
    await expect(requireStaffRole(["leadership"])).resolves.toEqual({
      id: "staff-1",
      name: "Leadership User",
      role: "leadership",
    });

    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("redirects signed-in staff away from routes their role cannot access", async () => {
    authState.staff = {
      id: "staff-2",
      name: "Trainer User",
      role: "school_trainer",
    };

    await expect(requireStaffRole(["leadership"])).rejects.toThrow("NEXT_REDIRECT:/dashboard");
    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
  });

  it("redirects unauthenticated users to login before checking allowed roles", async () => {
    authState.user = null;

    await expect(requireStaffRole(["leadership"])).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });
});
