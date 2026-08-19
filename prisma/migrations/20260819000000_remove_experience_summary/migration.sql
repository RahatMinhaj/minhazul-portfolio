-- Preserve legacy summaries as Lexical rich text before removing the field.
UPDATE "Experience"
SET "richDescription" = jsonb_build_object(
    'root', jsonb_build_object(
        'children', jsonb_build_array(
            jsonb_build_object(
                'children', jsonb_build_array(
                    jsonb_build_object(
                        'detail', 0,
                        'format', 0,
                        'mode', 'normal',
                        'style', '',
                        'text', "summary",
                        'type', 'text',
                        'version', 1
                    )
                ),
                'direction', NULL,
                'format', '',
                'indent', 0,
                'textFormat', 0,
                'textStyle', '',
                'type', 'paragraph',
                'version', 1
            )
        ),
        'direction', NULL,
        'format', '',
        'indent', 0,
        'type', 'root',
        'version', 1
    )
)
WHERE "richDescription" IS NULL
  AND "summary" IS NOT NULL
  AND btrim("summary") <> '';

ALTER TABLE "Experience" DROP COLUMN "summary";
