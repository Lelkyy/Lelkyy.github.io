/* The menu on a phone. The links fold behind one button there, so the
 * masthead stays a single line instead of wrapping into two; wider screens
 * never see the button.
 */

(function () {
  const btn = document.querySelector(".nav-toggle");
  const list = document.getElementById("nav-links");
  if (!btn || !list) return;

  function set(open) {
    list.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.textContent = open ? "Close" : "Menu";
  }

  btn.addEventListener("click", () => set(btn.getAttribute("aria-expanded") !== "true"));
  list.addEventListener("click", (e) => {
    if (e.target.closest("a")) set(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") set(false);
  });
})();
