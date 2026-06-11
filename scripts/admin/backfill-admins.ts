/**
 * One-time backfill: marks existing User rows as isAdmin = true based on the
 * (now removed) ADMIN_EMAILS env var allowlist.
 *
 * Run once after applying the `add_user_is_admin` migration in any
 * environment that previously had ADMIN_EMAILS configured:
 *
 *   ADMIN_EMAILS="alice@example.com,bob@example.com" npm run admin:backfill
 *
 * After this has run successfully, ADMIN_EMAILS can be removed from the
 * environment - admin status is read from User.isAdmin going forward.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const emails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (emails.length === 0) {
    console.log("ADMIN_EMAILS is not set - nothing to backfill.");
    return;
  }

  const result = await prisma.user.updateMany({
    where: { email: { in: emails } },
    data: { isAdmin: true }
  });

  console.log(`Marked ${result.count} of ${emails.length} configured admin email(s) as isAdmin.`);

  if (result.count < emails.length) {
    const found = await prisma.user.findMany({
      where: { email: { in: emails } },
      select: { email: true }
    });
    const foundEmails = new Set(found.map((u) => u.email));
    const missing = emails.filter((email) => !foundEmails.has(email));
    console.warn(
      `No User row found for: ${missing.join(", ")}. ` +
        "Those accounts will need to be promoted to admin once they sign up."
    );
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
