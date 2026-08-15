import { Input } from "@/components/ui/input";

export function AdminField({
  defaultValue,
  label,
  max,
  maxLength,
  min,
  minLength,
  name,
  pattern,
  required = false,
  step,
  type = "text",
}: {
  defaultValue?: string | number | undefined;
  label: string;
  max?: number | string;
  maxLength?: number;
  min?: number | string;
  minLength?: number;
  name: string;
  pattern?: string;
  required?: boolean;
  step?: number | string;
  type?: React.HTMLInputTypeAttribute;
}) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-medium">{label}</span>
      <Input
        defaultValue={defaultValue}
        max={max}
        maxLength={maxLength}
        min={min}
        minLength={minLength}
        name={name}
        pattern={pattern}
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
  maxLength,
  minLength,
  name,
  required = false,
  rows = 5,
}: {
  defaultValue?: string | undefined;
  label: string;
  maxLength?: number;
  minLength?: number;
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
        maxLength={maxLength}
        minLength={minLength}
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
