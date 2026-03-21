import { auth } from "@/auth";
import Sidebar from "@/app/components/Sidebar";

export default async function AboutPage() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user?.id);

  return (
    <div className="home-shell">
      <Sidebar />
      <main className="home">
        <div className="home__hero">
          <p className="home__eyebrow">About Us</p>
          <h1 className="home__title">The Knocore Mission</h1>
          <p className="about-mission__lead">College is complicated; succeeding shouldn&apos;t be.</p>
          <p className="home__subtitle">
            Every year, thousands of students walk onto campus blind, picking professors by luck,
            taking notes in a vacuum, and navigating the social maze alone. We built Knocore to
            change the game.
          </p>
          <div className="home__actions">
            <a className="primary-button" href="/">
              Search professors and courses
            </a>
            {!isLoggedIn && (
              <a className="ghost-button" href="/signup">
                Create an account
              </a>
            )}
          </div>
        </div>

        <section className="home__content">
          <div className="home__card about-mission">
            <p className="about-mission__eyebrow">How We Tie Campus Together</p>
            <p className="about-mission__statement">
              We believe that the best resource a student has is another student.
            </p>
            <div className="about-mission__divider" aria-hidden="true" />
            <div className="about-mission__pillars">
              <div className="about-mission__pillar">
                <p className="about-mission__pillar-number">01</p>
                <h3>Crowdsourced professor insights</h3>
                <p>See what grading, workload, and class structure are really like before enrolling.</p>
              </div>
              <div className="about-mission__pillar">
                <p className="about-mission__pillar-number">02</p>
                <h3>High-impact note sharing</h3>
                <p>Learn faster with practical notes, study guides, and course breakdowns from peers.</p>
              </div>
              <div className="about-mission__pillar">
                <p className="about-mission__pillar-number">03</p>
                <h3>Peer-to-peer support network</h3>
                <p>Navigate classes with students who have already gone through the same path.</p>
              </div>
            </div>
            <p className="about-mission__close">
              At Knocore, we don&apos;t just help you get the degree. We help you master the journey,
              tie your campus together, and take control of your education.
            </p>
          </div>

          <div className="home__card">
            <h2>Built on real student materials, not just opinions</h2>
            <p>
              We are building the most trusted place to understand professors and courses through
              real, student-shared resources organized by school, course, professor, and term.
            </p>
          </div>

          <div className="home__card">
            <h2>On Knocore you can</h2>
            <ul className="about-list">
              <li>
                Search any professor or course and see the details that matter: grading breakdowns,
                workload expectations, and exam style.
              </li>
              <li>
                Explore student-contributed materials like study guides, notes, syllabus
                breakdowns, and practical tips.
              </li>
              <li>Save professors and courses to get updates when new materials are posted.</li>
              <li>
                Build a profile that personalizes what you see based on your school, major, and
                schedule.
              </li>
            </ul>
          </div>

          <div className="home__card">
            <h2>Verified students = trusted contributions</h2>
            <p>
              Anyone can leave a review anywhere. We are focused on trust. That is why Knocore is
              built around verified student profiles. Verification keeps contributions relevant to
              real classes at real schools and creates accountability that improves quality over
              time.
            </p>
            <p className="about-muted">Verified students can:</p>
            <ul className="about-list">
              <li>Upload materials and tips tied to specific courses and terms.</li>
              <li>Earn contributor badges and perks.</li>
              <li>Track the impact of their contributions (students helped, views, saves).</li>
            </ul>
          </div>

          <div className="home__card">
            <h2>What we allow (and what we don&apos;t)</h2>
            <p>
              We are here to support learning and course planning. We do not allow content that
              violates academic integrity or copyright.
            </p>
            <div className="about-columns">
              <div>
                <h3>We encourage</h3>
                <ul className="about-list">
                  <li>Student-created notes, study guides, and summaries.</li>
                  <li>Syllabus breakdowns and what-to-expect intel.</li>
                  <li>Practice resources created by students.</li>
                </ul>
              </div>
              <div>
                <h3>We remove</h3>
                <ul className="about-list">
                  <li>Copyrighted materials shared without permission.</li>
                  <li>Exam answer keys or content intended to enable cheating.</li>
                  <li>Anything flagged as harmful, irrelevant, or misleading.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="home__card">
            <h2>Want to help build it?</h2>
            <p>
              If you are a student who wants to make course planning easier for everyone, join us
              by verifying your school and contributing what helped you succeed.
            </p>
            <div className="home__actions">
              {!isLoggedIn && (
                <a className="primary-button" href="/signup">
                  Create your profile
                </a>
              )}
              <a className="ghost-button" href="/">
                Browse the library
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
