"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getDefaultHeroCodeColor,
  HERO_CODE_COLORS,
  type HeroCodeColor,
  type HeroCodeProperty,
} from "@/features/profile/hero-content";

type PropertyType = "string" | "number" | "boolean" | "null";
type EditableProperty = {
  id: number;
  key: string;
  type: PropertyType;
  value: string;
  color: HeroCodeColor;
};

function getPropertyType(value: HeroCodeProperty["value"]): PropertyType {
  if (value === null) return "null";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  return "string";
}

export function DeveloperCodePropertiesField({
  initialProperties,
}: {
  initialProperties: readonly HeroCodeProperty[];
}) {
  const nextId = useRef(initialProperties.length);
  const [properties, setProperties] = useState<EditableProperty[]>(() =>
    initialProperties.map((property, index) => ({
      id: index,
      key: property.key,
      type: getPropertyType(property.value),
      value: property.value === null ? "" : String(property.value),
      color: property.color ?? getDefaultHeroCodeColor(property.value),
    })),
  );

  const serializedProperties = properties.map(({ key, type, value, color }) => ({
    key,
    color,
    value:
      type === "number"
        ? Number(value)
        : type === "boolean"
          ? value === "true"
          : type === "null"
            ? null
            : value,
  }));

  function updateProperty(
    id: number,
    update: Partial<Omit<EditableProperty, "id">>,
  ) {
    setProperties((current) =>
      current.map((property) =>
        property.id === id ? { ...property, ...update } : property,
      ),
    );
  }

  function changeType(property: EditableProperty, type: PropertyType) {
    const value =
      type === "boolean" ? "true" : type === "null" ? "" : property.value;
    updateProperty(property.id, { type, value });
  }

  function getColorOption(colorId: HeroCodeColor) {
    return HERO_CODE_COLORS.find((color) => color.id === colorId) ?? HERO_CODE_COLORS[0];
  }

  function moveProperty(index: number, offset: -1 | 1) {
    setProperties((current) => {
      const targetIndex = index + offset;
      if (targetIndex < 0 || targetIndex >= current.length) return current;

      const reordered = [...current];
      const [property] = reordered.splice(index, 1);
      if (!property) return current;
      reordered.splice(targetIndex, 0, property);
      return reordered;
    });
  }

  return (
    <fieldset className="space-y-4 md:col-span-2">
      <input
        name="heroCodeProperties"
        type="hidden"
        value={JSON.stringify(serializedProperties)}
      />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <legend className="text-sm font-medium">Object properties</legend>
          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
            Add, edit, or remove up to 16 fields. Property names must be valid
            JavaScript identifiers. Pick a highlight color for each value in the
            hero code panel.
          </p>
        </div>
        <Button
          disabled={properties.length >= 16}
          onClick={() => {
            const id = nextId.current++;
            setProperties((current) => [
              ...current,
              { id, key: "", type: "string", value: "", color: "cyan" },
            ]);
          }}
          size="sm"
          type="button"
          variant="outline"
        >
          <Plus aria-hidden size={14} />
          Add property
        </Button>
      </div>

      {properties.map((property) => {
        const selectedColor = getColorOption(property.color);

        return (
        <div
          className="grid gap-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-raised)] p-4 sm:grid-cols-[minmax(0,1fr)_8rem_8rem_minmax(0,1fr)_auto]"
          key={property.id}
        >
          <label className="space-y-2 text-sm">
            <span className="font-medium">Property name</span>
            <Input
              maxLength={40}
              onChange={(event) =>
                updateProperty(property.id, { key: event.target.value })
              }
              pattern="[A-Za-z_$][A-Za-z0-9_$]*"
              placeholder="location"
              required
              value={property.key}
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Type</span>
            <select
              className="h-10 w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[var(--accent)]"
              onChange={(event) =>
                changeType(property, event.target.value as PropertyType)
              }
              value={property.type}
            >
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="null">Null</option>
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Color</span>
            <div className="flex h-10 items-center gap-2 rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3">
              <span
                aria-hidden
                className={`size-3 shrink-0 rounded-full ${selectedColor.swatchClass}`}
              />
              <select
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                onChange={(event) =>
                  updateProperty(property.id, {
                    color: event.target.value as HeroCodeColor,
                  })
                }
                value={property.color}
              >
                {HERO_CODE_COLORS.map((color) => (
                  <option key={color.id} value={color.id}>
                    {color.label}
                  </option>
                ))}
              </select>
            </div>
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Value</span>
            {property.type === "boolean" ? (
              <select
                className="h-10 w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[var(--accent)]"
                onChange={(event) =>
                  updateProperty(property.id, {
                    value: event.target.value,
                  })
                }
                value={property.value}
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            ) : (
              <Input
                disabled={property.type === "null"}
                maxLength={property.type === "string" ? 160 : undefined}
                onChange={(event) =>
                  updateProperty(property.id, {
                    value: event.target.value,
                  })
                }
                required={property.type !== "null"}
                type={property.type === "number" ? "number" : "text"}
                value={property.type === "null" ? "null" : property.value}
              />
            )}
          </label>
          <div className="flex self-end">
            <Button
              aria-label={`Move ${property.key || "property"} up`}
              disabled={properties.indexOf(property) === 0}
              onClick={() => moveProperty(properties.indexOf(property), -1)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <ArrowUp aria-hidden size={15} />
            </Button>
            <Button
              aria-label={`Move ${property.key || "property"} down`}
              disabled={properties.indexOf(property) === properties.length - 1}
              onClick={() => moveProperty(properties.indexOf(property), 1)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <ArrowDown aria-hidden size={15} />
            </Button>
            <Button
              aria-label={`Remove ${property.key || "property"}`}
              onClick={() =>
                setProperties((current) =>
                  current.filter((item) => item.id !== property.id),
                )
              }
              size="icon"
              type="button"
              variant="ghost"
            >
              <Trash2 aria-hidden size={15} />
            </Button>
          </div>
        </div>
        );
      })}
    </fieldset>
  );
}
