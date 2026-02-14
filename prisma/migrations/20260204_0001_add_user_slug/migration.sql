ALTER TABLE "User" ADD COLUMN "slug" TEXT;

WITH professor_base AS (
  SELECT
    id,
    NULLIF(
      regexp_replace(
        regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g'),
        '(^-|-$)+',
        '',
        'g'
      ),
      ''
    ) AS slug_base
  FROM "User"
  WHERE role = 'PROFESSOR' AND name IS NOT NULL
),
professor_ranked AS (
  SELECT
    id,
    slug_base,
    ROW_NUMBER() OVER (PARTITION BY slug_base ORDER BY id) AS rn
  FROM professor_base
  WHERE slug_base IS NOT NULL
)
UPDATE "User" u
SET slug = CASE
  WHEN professor_ranked.rn = 1 THEN professor_ranked.slug_base
  ELSE professor_ranked.slug_base || '-' || professor_ranked.rn
END
FROM professor_ranked
WHERE u.id = professor_ranked.id;

CREATE UNIQUE INDEX "User_slug_key" ON "User"("slug");
