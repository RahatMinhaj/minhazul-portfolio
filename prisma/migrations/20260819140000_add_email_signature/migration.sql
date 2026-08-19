DO $$ BEGIN
  ALTER TABLE "SiteSettings" ADD COLUMN "emailSignature" JSONB;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
