import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/app/components/Sidebar";
import SearchBox from "@/app/components/SearchBox";
import HomeOneBento from "@/app/components/home/HomeOneBento";

function hasTomorrowClass(meetingTimes: string | null, tomorrow: number) {
  if (!meetingTimes) return false;
  const normalized = meetingTimes.toUpperCase().replace(/\s+/g, "");
  const dayPart = normalized.match(/^[A-Z]+/)?.[0] ?? "";
  const parsedTokens = dayPart.match(/TH|SU|SA|TU|MON|TUE|WED|THU|FRI|SAT|SUN|M|T|W|R|F/g) ?? [];
  const tokenSet = new Set(parsedTokens);

  const dayTokens: Record<number, string[]> = {
    0: ["SU", "SUN"],
    1: ["M", "MON"],
    2: ["TU", "TUE", "T"],
    3: ["W", "WED"],
    4: ["TH", "THU", "R"],
    5: ["F", "FRI"],
    6: ["SA", "SAT", "S"]
  };

  return dayTokens[tomorrow].some((token) => tokenSet.has(token));
}

export default async function HomeVariantOnePage() {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const [primarySchool, scheduleEntries, savedCoursesCount, unreadNotificationsCount] = userId
    ? await Promise.all([
        prisma.userSchool.findFirst({
          where: { userId, role: "STUDENT" },
          select: {
            school: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { createdAt: "asc" }
        }),
        prisma.scheduleEntry.findMany({
          where: { userId },
          select: { meetingTimes: true },
          take: 30
        }),
        prisma.savedCourse.count({ where: { userId } }),
        prisma.notification.count({ where: { userId, readAt: null } })
      ])
    : [null, [], 0, 0];

  const schoolId = primarySchool?.school.id ?? "";
  const schoolName = primarySchool?.school.name ?? "";
  const hour = new Date().getHours();
  const mood = hour < 12 ? "calm" : hour < 18 ? "focus" : "neon";
  const tomorrow = (new Date().getDay() + 1) % 7;
  const tomorrowClasses = scheduleEntries.filter((entry) =>
    hasTomorrowClass(entry.meetingTimes, tomorrow)
  ).length;
  const prioritizeExamPrep = tomorrowClasses > 0 || (hour >= 18 && scheduleEntries.length > 0);

  return (
    <div className="home-shell">
      <Sidebar />
      <main className={`home home--hero home--cyber home--cyber-${mood}`}>
        <section className="home__layout">
          <div className="home__left">
            <div className="home__hero">
              <p className="home__eyebrow">Knocore</p>
              <h1 className="home__title">A student OS for classes, notes, and real-talk ratings.</h1>
              <p className="home__subtitle">
                Scan what matters in seconds. Plan smarter, prep faster, and stay synced with your
                campus flow.
              </p>
            </div>

            <SearchBox
              submitLabel="Search now"
              directProfessorNavigation
              filters={schoolId ? { schoolId } : undefined}
            />

            {schoolName && (
              <p className="home__context-note">
                Results are currently scoped to <strong>{schoolName}</strong>. You can change this in
                search filters.
              </p>
            )}

            <HomeOneBento
              mood={mood}
              prioritizeExamPrep={prioritizeExamPrep}
              scheduleCount={scheduleEntries.length}
              savedCoursesCount={savedCoursesCount}
              unreadNotificationsCount={unreadNotificationsCount}
              schoolName={schoolName}
            />
          </div>

          <div className="home__art" aria-hidden="true">
            <svg viewBox="0 0 1265 768" className="home__art-svg">
              <path
                className="home__art-singleline"
                d="M30 706C214 696 392 694 568 704C742 714 930 710 1116 698C1170 694 1216 694 1254 700
                M470 104C648 112 828 126 1006 142C1048 146 1062 156 1060 192C1056 276 1054 362 1054 448C1054 470 1044 480 1022 478C844 468 664 456 486 446C456 444 444 430 442 402C438 306 438 210 446 114C448 94 458 90 470 104
                M770 178C756 180 746 190 746 204C746 220 758 232 772 232C788 232 800 220 800 204C800 188 788 176 770 178
                M776 232C792 260 794 290 792 322C790 350 792 378 794 404C796 420 804 426 814 422C826 418 828 404 826 386C824 356 820 326 822 296C824 268 832 242 852 222
                M810 284C840 264 868 246 896 228
                M804 310C832 324 858 340 880 360
                M794 404C792 430 796 454 808 474
                M248 390C232 392 220 404 220 420C220 438 234 452 250 452C268 452 282 438 282 420C282 402 268 388 248 390
                M254 452C270 476 272 504 270 534C268 562 268 590 270 616C272 634 280 642 292 638C304 634 306 620 304 602C302 572 298 544 300 516C302 492 310 470 326 454
                M418 410C402 412 390 424 390 440C390 458 404 472 420 472C438 472 452 458 452 440C452 422 438 408 418 410
                M424 472C442 500 446 532 444 566C442 596 442 626 444 652C446 668 454 676 466 672C478 668 480 654 478 636C476 606 472 574 474 544C476 520 484 498 500 482
                M592 430C576 432 564 444 564 460C564 478 578 492 594 492C612 492 626 478 626 460C626 442 612 428 592 430
                M598 492C616 520 620 552 618 586C616 616 616 646 618 672C620 688 628 696 640 692C652 688 654 674 652 656C650 626 646 594 648 564C650 540 658 518 674 502
                M258 506C396 488 532 488 672 510C712 516 724 530 696 548C614 602 534 654 452 706
                M318 510C354 560 392 610 430 660
                M500 506C498 568 496 630 494 692"
              />
            </svg>
          </div>
        </section>
      </main>
    </div>
  );
}
