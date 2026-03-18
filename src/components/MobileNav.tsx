"use client";

import { useState } from "react";

const navItems = [
  { label: "HOME", href: "/" },
  { label: "HOLIDAYS", href: "#" },
  { label: "TECHNOLOGY", href: "/technology" },
  { label: "APPROACHING.AI", href: "#" },
  { label: "OTHERS", href: "#" },
  { label: "CONTACT", href: "#" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="mobile-hamburger"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        <span className="mobile-hamburger-icon" data-active={open} />
      </button>

      <nav
        className="mobile-nav-overlay"
        style={{ transform: open ? "translateY(0)" : "translateY(-100%)" }}
      >
        <ul className="mobile-nav-list">
          {navItems.map((item, i) => (
            <li
              key={item.label}
              className="mobile-nav-item"
              style={i === 0 ? { borderTopWidth: 1 } : {}}
            >
              <a href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <style>{`
        .mobile-hamburger {
          display: none;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          z-index: 200;
        }
        @media (max-width: 48em) {
          .mobile-hamburger { display: flex; }
        }
        .mobile-hamburger-icon {
          display: inline-block;
          height: 2px;
          width: 25px;
          background-color: #1a1a1a;
          position: relative;
          transition: background-color 300ms;
        }
        .mobile-hamburger-icon[data-active="true"] {
          background-color: transparent;
        }
        .mobile-hamburger-icon::before,
        .mobile-hamburger-icon::after {
          content: '';
          background-color: #1a1a1a;
          display: block;
          height: 2px;
          position: absolute;
          transition: top 300ms, transform 300ms;
          width: 25px;
        }
        .mobile-hamburger-icon::before { top: -8px; }
        .mobile-hamburger-icon::after { top: 8px; }
        .mobile-hamburger-icon[data-active="true"]::before {
          top: 0;
          transform: rotate(135deg);
        }
        .mobile-hamburger-icon[data-active="true"]::after {
          top: 0;
          transform: rotate(-135deg);
        }

        .mobile-nav-overlay {
          display: none;
          align-items: center;
          background: whitesmoke;
          flex-direction: column;
          height: 100vh;
          width: 100vw;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 150;
          transition: transform 500ms ease;
        }
        @media (max-width: 48em) {
          .mobile-nav-overlay { display: flex; }
        }
        .mobile-nav-list {
          margin-top: 6em;
          margin-bottom: 1em;
          list-style: none;
          padding: 0;
          width: 80%;
        }
        .mobile-nav-item {
          border-color: #333;
          border-style: solid;
          border-width: 0 0 1px;
          font-size: 1rem;
          letter-spacing: 0.1em;
          padding: 0.8em;
          text-transform: uppercase;
          color: #333;
          transition: background 200ms;
        }
        .mobile-nav-item:hover { background: white; }
        .mobile-nav-item a {
          text-decoration: none;
          color: inherit;
          display: block;
        }
      `}</style>
    </>
  );
}
