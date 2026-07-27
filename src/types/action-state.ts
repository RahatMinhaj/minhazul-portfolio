export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  version?: number;
};

export const initialActionState: ActionState = { status: "idle" };
