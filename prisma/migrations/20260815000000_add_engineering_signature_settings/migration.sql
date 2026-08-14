ALTER TABLE "SiteSettings"
ADD COLUMN "engineeringSectionLabel" TEXT NOT NULL DEFAULT '01 / Engineering signature',
ADD COLUMN "engineeringLinkLabel" TEXT NOT NULL DEFAULT 'Full skill map',
ADD COLUMN "engineeringCoreLabel" TEXT NOT NULL DEFAULT 'Core strengths',
ADD COLUMN "engineeringInventoryLabel" TEXT NOT NULL DEFAULT 'Technology inventory',
ADD COLUMN "engineeringScrollLabel" TEXT NOT NULL DEFAULT 'Scroll to explore';
