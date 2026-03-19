"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import type { Session } from "next-auth";
import SchoolContextPill from "@/app/components/SchoolContextPill";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 11.5 12 5l8 6.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M6.5 10.8V19h11V10.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    )
  },
  {
    label: "Top Professors",
    href: "/top-professors",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M5.5 19c1.8-3 4.2-4.5 6.5-4.5S16.7 16 18.5 19"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    )
  },
  {
    label: "Top Schools",
    href: "/top-schools",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M4 10.5 12 6l8 4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M6 10.7V18h12v-7.3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M9 18v-4h6v4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    )
  },
  {
    label: "About",
    href: "/about",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 10v6" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="7.5" r="1" fill="currentColor" />
      </svg>
    )
  }
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { status, data: session } = useSession();
  const isAuthed = status === "authenticated";
  const isProfessor = (session as Session & { user?: { role?: string } })?.user?.role === "PROFESSOR";

  useEffect(() => {
    if (window.innerWidth > 900) {
      setOpen(true);
    }
  }, []);

  return (
    <aside className={open ? "sidebar is-open" : "sidebar"}>
      <div className="sidebar__header">
        <button
          className="sidebar__toggle"
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="sidebar-nav"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <span className="sidebar__toggle-icon" aria-hidden="true">
            {open ? "✕" : "☰"}
          </span>
        </button>
      </div>
      {open && <SchoolContextPill />}
      <nav id="sidebar-nav" className="sidebar__nav" aria-label="Primary">
        {navItems.map((item) => (
          <a key={item.label} className="sidebar__link" href={item.href}>
            <span className="sidebar__link-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="sidebar__link-text">{item.label}</span>
          </a>
        ))}
      </nav>
      <div className="sidebar__footer">
        {isAuthed ? (
          <>
            {isProfessor && (
              <a className="sidebar__action sidebar__action--ghost" href="/professor-portal">
                Professor Portal
              </a>
            )}
            <a className="sidebar__action" href="/dashboard">
              Dashboard
            </a>
            <a className="sidebar__action sidebar__action--ghost" href="/settings">
              Settings
            </a>
            <button
              type="button"
              className="sidebar__action sidebar__action--ghost sidebar__action--logout"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <a className="sidebar__action" href="/signup">
              Sign up
            </a>
            <a className="sidebar__action sidebar__action--ghost" href="/login">
              Log in
            </a>
            <a className="sidebar__action sidebar__action--ghost" href="/signup/professor">
              Faculty sign up
            </a>
          </>
        )}
      </div>
      <nav className="sidebar__bottom-nav" aria-label="Mobile primary">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <a key={`mobile-${item.label}`} className={isActive ? "sidebar__bottom-link is-active" : "sidebar__bottom-link"} href={item.href}>
              <span className="sidebar__bottom-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="sidebar__bottom-text">{item.label}</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
