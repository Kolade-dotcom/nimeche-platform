"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const TARGETS =
  "main > section, main [data-slot='card'], main li, main article, main [data-motion='reveal']";

/** Adds scroll reveals after hydration, so content stays visible without JS. */
export function ScrollMotion() {
  const pathname = usePathname();

  useEffect(() => {
    // Member, Exco and shareable profile pages must never depend on an
    // animation observer to reveal essential account information. Clear
    // classes left behind during client navigation.
    if (
      pathname.startsWith("/exco") ||
      pathname.startsWith("/me") ||
      pathname.startsWith("/u/")
    ) {
      document.querySelectorAll<HTMLElement>(".scroll-reveal").forEach((node) => {
        node.classList.remove("scroll-reveal", "is-revealed");
        node.style.removeProperty("--reveal-delay");
      });
      return;
    }

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    let sequence = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -32px 0px" }
    );

    function scan(root: ParentNode) {
      const nodes = [...root.querySelectorAll<HTMLElement>(TARGETS)];
      if (root instanceof HTMLElement && root.matches(TARGETS)) nodes.unshift(root);
      for (const node of nodes) {
        if (node.classList.contains("scroll-reveal")) continue;
        node.classList.add("scroll-reveal");
        node.style.setProperty("--reveal-delay", `${(sequence++ % 4) * 55}ms`);
        observer.observe(node);
      }
    }

    scan(document);
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node instanceof HTMLElement) scan(node);
        }
      }
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
