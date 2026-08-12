UPDATE "ThemeDefinition"
SET "sortOrder" = "sortOrder" + 1
WHERE "sortOrder" >= 1
  AND "slug" <> 'turquoise-tide';

UPDATE "ThemeDefinition"
SET "isDefault" = false;

INSERT INTO "ThemeDefinition" (
    "id",
    "name",
    "slug",
    "description",
    "configuration",
    "isDefault",
    "active",
    "sortOrder",
    "createdAt",
    "updatedAt"
)
VALUES (
    'theme_turquoise_tide',
    'Turquoise Tide',
    'turquoise-tide',
    'Deep lagoon surfaces, crystalline turquoise light, and calm flowing depth.',
    '{"mode":"dark","accent":"#2dd4bf","surface":"#08201e","personality":"Refreshing"}'::jsonb,
    true,
    true,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO UPDATE SET
    "name" = EXCLUDED."name",
    "description" = EXCLUDED."description",
    "configuration" = EXCLUDED."configuration",
    "isDefault" = true,
    "active" = true,
    "updatedAt" = CURRENT_TIMESTAMP;

UPDATE "SiteSettings"
SET "defaultTheme" = 'turquoise-tide',
    "updatedAt" = CURRENT_TIMESTAMP;
