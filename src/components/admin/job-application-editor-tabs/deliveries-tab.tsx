"use client";

import { formatDate } from "@/lib/utils/date";
import type { Application } from "./job-application-editor-types";

export function DeliveriesTab({ application }: { application: Application }) {
  return (
    <div className="space-y-4">
      {application.deliveries.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No deliveries yet.</p>
      ) : (
        application.deliveries.map((delivery) => (
          <div
            className="rounded-[var(--radius-card)] border border-[var(--border)] p-4"
            key={delivery.id}
          >
            <div className="flex items-center gap-3">
              <span className="rounded bg-[var(--surface-raised)] px-2 py-0.5 text-xs font-medium">
                {delivery.status}
              </span>
              <span className="text-xs text-[var(--muted)]">
                To: {delivery.toAddress}
              </span>
              <span className="text-xs text-[var(--muted)]">
                {formatDate(delivery.createdAt)}
              </span>
            </div>
            <p className="mt-2 text-sm">Subject: {delivery.subjectSnapshot}</p>
            {delivery.attachmentName ? (
              <p className="mt-1 text-xs text-[var(--muted)]">
                Attachment: {delivery.attachmentName}
              </p>
            ) : null}
            {delivery.lastError ? (
              <p className="mt-2 text-xs text-red-500">
                Error: {delivery.lastError}
              </p>
            ) : null}
          </div>
        ))
      )}
    </div>
  );
}
