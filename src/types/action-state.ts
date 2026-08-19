export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  version?: number;
  data?: Record<string, unknown> | undefined;
};

export const initialActionState: ActionState = { status: "idle" };
