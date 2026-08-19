ALTER TABLE "Project"
ALTER COLUMN "problemStatement" TYPE JSONB
USING CASE
  WHEN "problemStatement" IS NULL THEN NULL
  ELSE jsonb_build_object(
    'type', 'doc',
    'content', jsonb_build_array(
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(
          jsonb_build_object('type', 'text', 'text', "problemStatement")
        )
      )
    )
  )
END;
