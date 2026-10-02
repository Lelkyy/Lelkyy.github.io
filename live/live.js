/* The tabs on /live/. One thing runs at a time: the map is framed on load
 * by script.js where its server allows it, and the rest start the first time
 * their tab is opened, so MoveGrade's engine, the card table and the GitHub
 * calls cost nothing until someone asks for them. The open tab is kept in
 * the address, so /live/#durak lands on the table.
 */

(function () {
  const tabs = Array.from(document.querySelectorAll("#live-tabs [role=tab]"));
  if (!tabs.length) return;

  function load(src) {
    return new Promise((done, fail) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = done;
      s.onerror = fail;
      document.body.appendChild(s);
    });
  }

  const started = {};
  const start = {
    movegrade() {
      load("/case/movegrade-demo.js?v=5").then(() => {
        if (window.mountMoveGradeDemo) window.mountMoveGradeDemo(document.getElementById("mg-root"));
      });
    },
    durak() {
      if (typeof window.startDurak === "function") window.startDurak();
    },
    commits() {
      load("/live/commits.js?v=6");
    },
  };

  function open(name, push) {
    const tab = tabs.find((t) => t.dataset.panel === name) || tabs[0];
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    const key = tab.dataset.panel;
    if (!started[key] && start[key]) {
      started[key] = true;
      start[key]();
    }
    if (push) history.replaceState(null, "", "#" + key);
  }

  tabs.forEach((t, i) => {
    t.addEventListener("click", () => open(t.dataset.panel, true));
    t.addEventListener("keydown", (e) => {
      const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      const next = tabs[(i + step + tabs.length) % tabs.length];
      next.focus();
      open(next.dataset.panel, true);
    });
  });

  window.addEventListener("hashchange", () => open(location.hash.slice(1), false));
  open(location.hash.slice(1), false);
})();
