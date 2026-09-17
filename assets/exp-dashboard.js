!(function () {
  "use strict";
  const t = (t) => document.getElementById(t),
    e = "expDashboardData.v1",
    a = (t) =>
      isNaN(t)
        ? ""
        : Number(t).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
    n = (t) =>
      String(null == t ? "" : t).replace(
        /[&<>"']/g,
        (t) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[t],
      );
  function o(t, e, a) {
    return (
      '<div class="tile ' +
      (a || "") +
      '"><div class="k">' +
      t +
      '</div><div class="v">' +
      e +
      "</div></div>"
    );
  }
  function d(e, o, d, r) {
    const i = d.length ? d[0].amount : 0,
      s = t(e);
    if (!d.length)
      return (
        (s.innerHTML = '<p class="muted" style="font-size:13px;">No data.</p>'),
        void (t(o).innerHTML = "")
      );
    s.innerHTML = d
      .map((t) => {
        const e =
            i > 0 ? Math.max((t.amount / i) * 100, t.amount > 0 ? 2 : 0) : 0,
          o =
            t.key +
            ": $" +
            a(t.amount) +
            " (" +
            t.count +
            " txn" +
            (1 === t.count ? "" : "s") +
            ")";
        return (
          '<div class="barrow' +
          (r ? " reason" : "") +
          '" title="' +
          n(o) +
          '"><div class="lbl">' +
          n(t.key) +
          '</div><div class="track"><div class="fill" style="width:' +
          e.toFixed(1) +
          '%"></div></div><div class="val">$' +
          a(t.amount) +
          "</div></div>"
        );
      })
      .join("");
    let c =
      "<thead><tr><th>" +
      (r ? "Reason" : "Name") +
      '</th><th class="num">Amount</th><th class="num">Count</th></tr></thead><tbody>';
    (d.forEach((t) => {
      c +=
        "<tr><td>" +
        n(t.key) +
        '</td><td class="num">$' +
        a(t.amount) +
        '</td><td class="num">' +
        t.count +
        "</td></tr>";
    }),
      (c += "</tbody>"),
      (t(o).innerHTML = '<table class="data">' + c + "</table>"));
  }
  function r() {
    const n = (function () {
      try {
        const t = localStorage.getItem(e);
        return t ? JSON.parse(t) : null;
      } catch (t) {
        return null;
      }
    })();
    if (!n || !n.imported || !n.imported.length)
      return (
        t("emptyState").classList.remove("hidden"),
        void t("dashContent").classList.add("hidden")
      );
    (t("emptyState").classList.add("hidden"),
      t("dashContent").classList.remove("hidden"),
      (t("acctLabel").textContent =
        n.bankAccountLabel || "(account not recorded)"),
      (t("periodLabel").textContent = n.dateLabel || "n/a"),
      (t("asOfLabel").textContent =
        "Snapshot from " + new Date(n.builtAt).toLocaleString("en-US")));
    const r = n.reconciliation || {},
      i = n.imported.reduce((t, e) => t + Math.abs(e.amount), 0),
      s = n.excluded.reduce((t, e) => t + Math.abs(e.amount), 0);
    ((t("kpiTiles").innerHTML = [
      o("Transactions categorized", n.imported.length),
      o("Categorized total", "$" + a(i), "good"),
      o(
        "Needs review",
        n.excluded.length + " ($" + a(s) + ")",
        n.excluded.length ? "warnv" : "",
      ),
      o(
        "Reconciles",
        void 0 === r.ok ? "n/a" : r.ok ? "OK" : "MISMATCH",
        r.ok ? "good" : !1 === r.ok ? "warnv" : "",
      ),
    ].join("")),
      d(
        "chartCategory",
        "tableCategory",
        ExpCore.aggregate(n.imported, "account", 8),
      ),
      d("chartClass", "tableClass", ExpCore.aggregate(n.imported, "klass", 8)),
      d(
        "chartVendor",
        "tableVendor",
        ExpCore.aggregate(n.imported, "payee", 10),
      ),
      d(
        "chartReason",
        "tableReason",
        ExpCore.aggregateReasons(n.excluded),
        !0,
      ));
  }
  document.addEventListener("DOMContentLoaded", () => {
    (r(),
      t("refreshBtn").addEventListener("click", r),
      t("clearBtn").addEventListener("click", () => {
        window.confirm(
          "Clear the stored dashboard data from this browser? This does not affect anything already downloaded.",
        ) && (localStorage.removeItem(e), r());
      }));
  });
})();
