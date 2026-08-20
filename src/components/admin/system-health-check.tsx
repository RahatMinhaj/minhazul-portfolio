"use client";

import { useState } from "react";
import { LoaderCircle, CheckCircle, XCircle, Plug } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  testDatabaseAction,
  testSmtpAction,
  testGeminiAction,
  testOpenRouterAction,
} from "@/server/actions/admin-health";
import type { ActionState } from "@/types/action-state";

type ServiceKey = "database" | "smtp" | "gemini" | "openrouter";

type ServiceStatus = {
  label: string;
  state: "idle" | "loading" | "success" | "error";
  message: string;
};

const SERVICES: { key: ServiceKey; label: string; test: (state: ActionState, formData: FormData) => Promise<ActionState> }[] = [
  { key: "database", label: "Database", test: testDatabaseAction },
  { key: "smtp", label: "Gmail (SMTP)", test: testSmtpAction },
  { key: "gemini", label: "Gemini AI", test: testGeminiAction },
  { key: "openrouter", label: "OpenRouter AI", test: testOpenRouterAction },
];

export function SystemHealthCheck() {
  const [statuses, setStatuses] = useState<Record<ServiceKey, ServiceStatus>>({
    database: { label: "Database", state: "idle", message: "" },
    smtp: { label: "Gmail (SMTP)", state: "idle", message: "" },
    gemini: { label: "Gemini AI", state: "idle", message: "" },
    openrouter: { label: "OpenRouter AI", state: "idle", message: "" },
  });

  async function runTest(key: ServiceKey, action: (state: ActionState, formData: FormData) => Promise<ActionState>) {
    setStatuses((prev) => ({ ...prev, [key]: { ...prev[key], state: "loading", message: "" } }));
    try {
      const result = await action({ status: "idle" }, new FormData());
      setStatuses((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          state: result.status === "success" ? "success" : "error",
          message: result.message,
        },
      }));
    } catch (error) {
      setStatuses((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          state: "error",
          message: error instanceof Error ? error.message : String(error),
        },
      }));
    }
  }

  function runAllTests() {
    for (const svc of SERVICES) {
      runTest(svc.key, svc.test);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>System Health</CardTitle>
        <Button onClick={runAllTests} size="sm" variant="outline">
          <Plug className="size-3.5" />
          Test All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-[var(--border)]">
          {SERVICES.map((svc) => {
            const s = statuses[svc.key];
            return (
              <div className="flex items-center justify-between gap-4 py-3" key={svc.key}>
                <div className="flex items-center gap-3 min-w-0">
                  {s.state === "loading" ? (
                    <LoaderCircle className="size-4 shrink-0 animate-spin text-[var(--muted)]" />
                  ) : s.state === "success" ? (
                    <CheckCircle className="size-4 shrink-0 text-green-500" />
                  ) : s.state === "error" ? (
                    <XCircle className="size-4 shrink-0 text-red-500" />
                  ) : (
                    <div className="size-4 shrink-0 rounded-full border border-[var(--border)]" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{svc.label}</p>
                    {s.message ? (
                      <p className={`mt-0.5 text-xs truncate ${s.state === "error" ? "text-red-500" : s.state === "success" ? "text-green-500" : "text-[var(--muted)]"}`}>
                        {s.message}
                      </p>
                    ) : null}
                  </div>
                </div>
                <Button
                  disabled={s.state === "loading"}
                  onClick={() => runTest(svc.key, svc.test)}
                  size="sm"
                  variant="ghost"
                >
                  {s.state === "loading" ? "Testing…" : "Test"}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
