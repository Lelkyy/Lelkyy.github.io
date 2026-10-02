/* The header. On a phone the links fold behind one Menu button. On the
 * home page the bar starts clear over the photograph and turns solid once
 * the page has scrolled past the top of it.
 */

(function () {
  const head = document.querySelector(".site-head");
  const btn = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");

  if (btn && nav) {
    const set = (open) => {
      nav.classList.toggle("open", open);
      if (head) head.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
      btn.textContent = open ? "Close" : "Menu";
    };
    btn.addEventListener("click", () => set(btn.getAttribute("aria-expanded") !== "true"));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  }

  if (head && document.body.classList.contains("home")) {
    const update = () => head.classList.toggle("solid", window.scrollY > 40);
    window.addEventListener("scroll", update, { passive: true });
    update();
  }
})();
