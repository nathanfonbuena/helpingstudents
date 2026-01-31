import Sidebar from "@/app/components/Sidebar";

export default function AboutPage() {
  return (
    <div className="home-shell">
      <Sidebar />
      <main className="home">
        <div className="home__hero">
          <p className="home__eyebrow">About Us</p>
          <h1 className="home__title">See what a class is really like—before you enroll.</h1>
          <p className="home__subtitle">
            Choosing classes should not feel like gambling. Most students still register with limited
            information, then discover too late that the workload, grading, and exam style are not
            what they expected. Classcrack exists to fix that.
          </p>
          <div className="home__actions">
            <a className="primary-button" href="/search">
              Search professors and courses
            </a>
            <a className="ghost-button" href="/signup">
              Create an account
            </a>
          </div>
        </div>

        <section className="home__content">
          <div className="home__card">
            <h2>Built on real student materials, not just opinions</h2>
            <p>
              We are building the most trusted place to understand professors and courses through
              real, student-shared resources—organized by school, course, professor, and term.
            </p>
          </div>

          <div className="home__card">
            <h2>On Classcrack you can</h2>
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
              Anyone can leave a review anywhere. We are focused on trust. That is why Classcrack is
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
            <h2>Our mission</h2>
            <p>
              To help students make smarter academic decisions—and to help every class feel more
              predictable, fair, and winnable.
            </p>
          </div>

          <div className="home__card">
            <h2>What we allow (and what we don’t)</h2>
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
              If you are a student who wants to make course planning easier for everyone, join us.
              Create an account, verify your school, and contribute what helped you succeed.
            </p>
            <div className="home__actions">
              <a className="primary-button" href="/signup">
                Create your profile
              </a>
              <a className="ghost-button" href="/search">
                Browse the library
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
