"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ArtifactsTab } from "@/components/admin/job-application-editor-tabs/artifacts-tab";
import { CircularTab } from "@/components/admin/job-application-editor-tabs/circular-tab";
import { ComposeTab } from "@/components/admin/job-application-editor-tabs/compose-tab";
import { DeliveriesTab } from "@/components/admin/job-application-editor-tabs/deliveries-tab";
import { DetailsTab } from "@/components/admin/job-application-editor-tabs/details-tab";
import type {
  Application,
  EditorTab,
} from "@/components/admin/job-application-editor-tabs/job-application-editor-types";

export function JobApplicationEditor({
  application,
  emailSignature,
  systemCv,
}: {
  application: Application;
  emailSignature?: unknown;
  systemCv?: { sizeBytes: number; updatedAt: Date } | null | undefined;
}) {
  const [activeTab, setActiveTab] = useState<EditorTab>(
    application.artifacts.length > 0 ? "compose" : "circular",
  );

  const subjectArtifact = application.artifacts.find((a) => a.kind === "subject");
  const emailBodyArtifact = application.artifacts.find(
    (a) => a.kind === "emailMessage",
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-1 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-1">
        <Button
          onClick={() => setActiveTab("circular")}
          size="sm"
          variant={activeTab === "circular" ? "default" : "ghost"}
        >
          Job Circular
        </Button>
        <Button
          onClick={() => setActiveTab("details")}
          size="sm"
          variant={activeTab === "details" ? "default" : "ghost"}
        >
          Details
        </Button>
        <Button
          onClick={() => setActiveTab("artifacts")}
          size="sm"
          variant={activeTab === "artifacts" ? "default" : "ghost"}
        >
          Generated Content ({application.artifacts.length})
        </Button>
        <Button
          onClick={() => setActiveTab("compose")}
          size="sm"
          variant={activeTab === "compose" ? "default" : "ghost"}
        >
          Compose Email
        </Button>
        <Button
          onClick={() => setActiveTab("deliveries")}
          size="sm"
          variant={activeTab === "deliveries" ? "default" : "ghost"}
        >
          Delivery History ({application.deliveries.length})
        </Button>
      </div>

      {activeTab === "circular" ? (
        <CircularTab application={application} />
      ) : null}
      {activeTab === "details" ? <DetailsTab application={application} /> : null}
      {activeTab === "artifacts" ? (
        <ArtifactsTab application={application} />
      ) : null}
      {activeTab === "compose" ? (
        <ComposeTab
          application={application}
          emailBodyArtifact={emailBodyArtifact}
          emailSignature={emailSignature}
          subjectArtifact={subjectArtifact}
          systemCv={systemCv}
        />
      ) : null}
      {activeTab === "deliveries" ? (
        <DeliveriesTab application={application} />
      ) : null}
    </div>
  );
}
