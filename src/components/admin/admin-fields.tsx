import { Input } from "@/components/ui/input";

export function AdminField({
  defaultValue,
  label,
  name,
  required = false,
  step,
  type = "text",
}: {
  defaultValue?: string | number | undefined;
  label: string;
  name: string;
  required?: boolean;
  step?: number | string;
  type?: React.HTMLInputTypeAttribute;
}) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-medium">{label}</span>
      <Input
        defaultValue={defaultValue}
        name={name}
        required={required}
        step={step}
        type={type}
      />
    </label>
  );
}

export function AdminTextarea({
  defaultValue,
  label,
  name,
  required = false,
  rows = 5,
}: {
  defaultValue?: string | undefined;
  label: string;
  name: string;
  required?: boolean;
  rows?: number;
}) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-medium">{label}</span>
      <textarea
        className="w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-3 text-sm outline-none focus:border-[var(--accent)]"
        defaultValue={defaultValue}
        name={name}
        required={required}
        rows={rows}
      />
    </label>
  );
}

export function AdminCheckbox({
  defaultChecked,
  label,
  name,
}: {
  defaultChecked?: boolean | undefined;
  label: string;
  name: string;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
      <input defaultChecked={defaultChecked} name={name} type="checkbox" />
      {label}
    </label>
  );
}
