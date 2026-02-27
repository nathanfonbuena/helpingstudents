"use client";

import { useMemo, useState } from "react";

type Mood = "calm" | "focus" | "neon";

interface HomeOneBentoProps {
  mood: Mood;
  prioritizeExamPrep: boolean;
  scheduleCount: number;
  savedCoursesCount: number;
  unreadNotificationsCount: number;
  schoolName?: string | null;
}

function buzz(ms: number) {
  if (typeof navigator === "undefined") return;
  if (typeof navigator.vibrate !== "function") return;
  navigator.vibrate(ms);
}

const ratingCards = [
  {
    name: "Dr. Lin",
    className: "PHYS 201",
    tags: ["Heavy Grader", "Slides are 10/10", "Exam-heavy"],
    score: "4.6"
  },
  {
    name: "Prof. Hassan",
    className: "CS 142",
    tags: ["Fast pace", "Curves fairly", "Great office hours"],
    score: "4.3"
  },
  {
    name: "Dr. Patel",
    className: "BIO 180",
    tags: ["Attendance matters", "Quiz every week", "Very clear notes"],
    score: "4.8"
  }
];

export default function HomeOneBento({
  mood,
  prioritizeExamPrep,
  scheduleCount,
  savedCoursesCount,
  unreadNotificationsCount,
  schoolName
}: HomeOneBentoProps) {
  const [notesSaved, setNotesSaved] = useState(false);
  const focusLabel = useMemo(() => {
    if (prioritizeExamPrep) return "Midterm mode";
    if (mood === "calm") return "Morning momentum";
    if (mood === "focus") return "Deep work";
    return "Social + study";
  }, [mood, prioritizeExamPrep]);

  return (
    <section className={`home-bento home-bento--${mood}`} aria-label="Student dashboard">
      <article className="bento-card bento-card--hero">
        <p className="bento-kicker">Main Character Mode</p>
        <h2>{focusLabel}</h2>
        <p>
          {prioritizeExamPrep
            ? "You have classes tomorrow. Knocore is prioritizing prep guides and fast rating intel."
            : "Your dashboard adapts by time of day so the right actions stay one thumb-tap away."}
        </p>
        <div className="bento-chip-row" aria-label="Real talk tags">
          <span className="bento-chip">Heavy Grader</span>
          <span className="bento-chip">Group project warning</span>
          <span className="bento-chip">Slides are 10/10</span>
        </div>
      </article>

      <article className="bento-card bento-card--stats">
        <h3>At a glance</h3>
        <dl className="bento-stats">
          <div>
            <dt>Saved classes</dt>
            <dd>{savedCoursesCount}</dd>
          </div>
          <div>
            <dt>This term</dt>
            <dd>{scheduleCount}</dd>
          </div>
          <div>
            <dt>Pings</dt>
            <dd>{unreadNotificationsCount}</dd>
          </div>
        </dl>
        {schoolName && <p className="bento-muted">Scoped to {schoolName}</p>}
      </article>

      <article className="bento-card bento-card--swipe">
        <h3>Professor vibe check</h3>
        <p className="bento-muted">Swipe cards for quick rating context.</p>
        <div className="rating-lane" role="list" aria-label="Swipeable professor cards">
          {ratingCards.map((card) => (
            <button
              key={card.name}
              type="button"
              className="rating-card"
              role="listitem"
              onClick={() => buzz(8)}
            >
              <p className="rating-card__score">{card.score}</p>
              <p className="rating-card__title">{card.name}</p>
              <p className="rating-card__subtitle">{card.className}</p>
              <div className="rating-card__tags">
                {card.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </article>

      <article className="bento-card bento-card--notes">
        <h3>Notes vault</h3>
        <p className="bento-muted">Save a guide and get tactile confirmation.</p>
        <button
          type="button"
          className={notesSaved ? "bento-save is-saved" : "bento-save"}
          onClick={() => {
            setNotesSaved((prev) => !prev);
            buzz(14);
          }}
        >
          {notesSaved ? "Saved to vault" : "Save exam prep set"}
        </button>
      </article>
    </section>
  );
}
