export type Artifact = {
  id: string;
  kind: string;
  customKind: string | null;
  title: string | null;
  content: string;
  format: string;
  sortOrder: number;
  generated: boolean;
};

export type Delivery = {
  id: string;
  status: string;
  fromAddress: string;
  toAddress: string;
  subjectSnapshot: string;
  attachmentName: string | null;
  createdAt: Date;
  sentAt: Date | null;
  lastError: string | null;
};

export type Application = {
  id: string;
  companyName: string;
  roleTitle: string;
  recipientEmail: string | null;
  contactName: string | null;
  sourceUrl: string | null;
  circularContent: string;
  jobDescription: string;
  status: string;
  tone: string | null;
  notes: string | null;
  customCvName: string | null;
  lastGeneratedAt: Date | null;
  sentAt: Date | null;
  artifacts: Artifact[];
  deliveries: Delivery[];
  createdAt: Date;
};

export type EditorTab =
  | "circular"
  | "details"
  | "artifacts"
  | "compose"
  | "deliveries";
