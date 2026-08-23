import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const generated = resolve(root, "src/generated/prisma");

function patchFile(relativePath, replacers) {
  const filePath = resolve(generated, relativePath);
  let content = readFileSync(filePath, "utf8");
  for (const [search, replace] of replacers) {
    if (!content.includes(search)) {
      throw new Error(`Expected snippet not found in ${relativePath}: ${search.slice(0, 80)}`);
    }
    content = content.replaceAll(search, replace);
  }
  writeFileSync(filePath, content);
}

patchFile("internal/prismaNamespace.ts", [
  [
    `  institution: 'institution',
  degree: 'degree',`,
    `  institution: 'institution',
  college: 'college',
  degree: 'degree',`,
  ],
]);

patchFile("internal/prismaNamespaceBrowser.ts", [
  [
    `  institution: 'institution',
  degree: 'degree',`,
    `  institution: 'institution',
  college: 'college',
  degree: 'degree',`,
  ],
]);

const educationReplacers = [
  [
    `  institution: string
  degree: string`,
    `  institution: string
  college: string | null
  degree: string`,
  ],
  [
    `  institution?: Prisma.StringFilter<"Education"> | string
  degree?: Prisma.StringFilter<"Education"> | string`,
    `  institution?: Prisma.StringFilter<"Education"> | string
  college?: Prisma.StringNullableFilter<"Education"> | string | null
  degree?: Prisma.StringFilter<"Education"> | string`,
  ],
  [
    `  institution?: Prisma.SortOrder
  degree?: Prisma.SortOrder`,
    `  institution?: Prisma.SortOrder
  college?: Prisma.SortOrder
  degree?: Prisma.SortOrder`,
  ],
  [
    `  institution?: boolean
  degree?: boolean`,
    `  institution?: boolean
  college?: boolean
  degree?: boolean`,
  ],
  [
    `  institution?: Prisma.StringWithAggregatesFilter<"Education"> | string
  degree?: Prisma.StringWithAggregatesFilter<"Education"> | string`,
    `  institution?: Prisma.StringWithAggregatesFilter<"Education"> | string
  college?: Prisma.StringNullableWithAggregatesFilter<"Education"> | string | null
  degree?: Prisma.StringWithAggregatesFilter<"Education"> | string`,
  ],
  [
    `  institution?: Prisma.StringFieldUpdateOperationsInput | string
  degree?: Prisma.StringFieldUpdateOperationsInput | string`,
    `  institution?: Prisma.StringFieldUpdateOperationsInput | string
  college?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  degree?: Prisma.StringFieldUpdateOperationsInput | string`,
  ],
];

patchFile("models/Education.ts", educationReplacers);

function patchClassMetadata() {
  const filePath = resolve(generated, "internal/class.ts");
  let content = readFileSync(filePath, "utf8");

  if (!content.includes('name\\":\\"college\\"')) {
    content = content.replace(
      'Education\\":{\\"fields\\":[{\\"name\\":\\"id\\",\\"kind\\":\\"scalar\\",\\"type\\":\\"String\\"},{\\"name\\":\\"institution\\",\\"kind\\":\\"scalar\\",\\"type\\":\\"String\\"},{\\"name\\":\\"degree\\",\\"kind\\":\\"scalar\\",\\"type\\":\\"String\\"}',
      'Education\\":{\\"fields\\":[{\\"name\\":\\"id\\",\\"kind\\":\\"scalar\\",\\"type\\":\\"String\\"},{\\"name\\":\\"institution\\",\\"kind\\":\\"scalar\\",\\"type\\":\\"String\\"},{\\"name\\":\\"college\\",\\"kind\\":\\"scalar\\",\\"type\\":\\"String\\"},{\\"name\\":\\"degree\\",\\"kind\\":\\"scalar\\",\\"type\\":\\"String\\"}',
    );
  }

  if (!content.includes("college     String?")) {
    content = content.replace(
      "model Education {\\n  id          String    @id @default(cuid())\\n  institution String\\n  degree      String",
      "model Education {\\n  id          String    @id @default(cuid())\\n  institution String\\n  college     String?\\n  degree      String",
    );
  }

  if (!content.includes('institution\\",\\"college\\",\\"degree\\",\\"field\\",\\"grade\\"')) {
    content = content.replace(
      'institution\\",\\"degree\\",\\"field\\",\\"grade\\"',
      'institution\\",\\"college\\",\\"degree\\",\\"field\\",\\"grade\\"',
    );
  }

  writeFileSync(filePath, content);
}

patchClassMetadata();

console.log("Patched generated Prisma client with Education.college.");
