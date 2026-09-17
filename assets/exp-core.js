!(function (e) {
  "use strict";
  function t(e) {
    return Math.round(100 * (e + Number.EPSILON)) / 100;
  }
  function n(e) {
    return e
      ? e.getMonth() + 1 + "/" + e.getDate() + "/" + e.getFullYear()
      : "";
  }
  function o(e) {
    return e
      ? e.getFullYear() + "-" + (e.getMonth() + 1) + "-" + e.getDate()
      : "";
  }
  function r(e) {
    return String(e || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, " ");
  }
  function a(e) {
    return String(e || "")
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, " ")
      .split(" ")
      .filter((e) => e.length >= 3);
  }
  function s(e) {
    const t = String(e || "").split(":");
    return t[t.length - 1].trim();
  }
  function c(e) {
    return String(e || "")
      .replace(/^\d{3,7}\s+/, "")
      .trim();
  }
  function u(e, t) {
    const n = new Set(a(e)),
      o = a(t);
    let r = 0;
    for (const e of o) n.has(e) && r++;
    return r;
  }
  function i(e) {
    const t = new Map();
    (e.coa || []).forEach((e) => {
      const n = r(e.msoCategory);
      n && t.set(n, e);
    });
    const n = new Map();
    (e.class || []).forEach((e) => {
      const t = r(e.msoClass);
      t && n.set(t, e);
    });
    const o = new Map();
    return (
      (e.vendor || []).forEach((e) => {
        const t = r(e.msoVendor);
        t && o.set(t, e);
      }),
      { coaMap: t, classMap: n, vendorMap: o }
    );
  }
  const l = /due\s*\(?to\)?\/from\s*related\s*party/i;
  function m(e) {
    return l.test(e || "");
  }
  function d(e, t) {
    const n = c(s(e));
    if (!n)
      return { ok: !1, reason: "MSO register line has no Account/category." };
    const o = t.get(r(n));
    if (!o)
      return {
        ok: !1,
        reason: 'No Master COA list mapping for MSO category "' + n + '".',
      };
    if ("(NEEDS REVIEW)" === r(o.hnAccount))
      return {
        ok: !1,
        reason:
          'Master COA list flags "' +
          n +
          '" as (needs review) — no HN account assigned yet.',
      };
    const a = o.hnAcct ? o.hnAcct + " " + o.hnAccount : o.hnAccount;
    return {
      ok: !0,
      cleaned: n,
      hnAcct: o.hnAcct || null,
      hnAccountName: o.hnAccount,
      hnAccount: a,
    };
  }
  function h(e, t) {
    const n = s(e);
    if (!n) return { ok: !1, reason: "MSO register line has no Class." };
    const o = t.get(r(n));
    return o
      ? { ok: !0, cleaned: n, hnClass: o.hnClass }
      : {
          ok: !1,
          reason: 'No Master class list mapping for MSO class "' + n + '".',
        };
  }
  function p(e, t) {
    const n = String(e || "").trim();
    if (!n) return { ok: !1, reason: "MSO register line has no Payee." };
    const o = t.get(r(n));
    return o
      ? { ok: !0, cleaned: n, hnVendor: o.hnVendor, source: "master" }
      : {
          ok: !1,
          reason: 'No Master Vendor list mapping for MSO vendor "' + n + '".',
        };
  }
  function q(e, t, n, o) {
    const a = String(e || "").trim(),
      s = String(t || "").trim(),
      c = p(a, n);
    if (c.ok) return c;
    const u = (o || []).filter((e) => e && e.hnVendor);
    const i = r(a),
      l = r(s);
    let m = u.find((e) => {
      const t = r(e.msoPayee),
        n = r(e.msoMemo);
      return t === i && n === l && (t || n);
    });
    if (!m)
      m = u.find((e) => {
        const t = r(e.msoPayee),
          n = r(e.msoMemo);
        return t && !n && t === i;
      });
    if (!m)
      m = u.find((e) => {
        const t = r(e.msoPayee),
          n = r(e.memoContains);
        return n && (!t || t === i) && l.includes(n);
      });
    if (m)
      return {
        ok: !0,
        cleaned: a,
        hnVendor: m.hnVendor,
        source: m.source || "payee-memo",
      };
    if (!a && !s)
      return { ok: !1, reason: "MSO register line has no Payee or Memo." };
    return {
      ok: !1,
      reason:
        'No vendor mapping found for MSO Payee "' +
        a +
        '" / Memo "' +
        s +
        '".',
    };
  }
  function f(e, r) {
    const a = new Map();
    return (
      r.forEach((e, n) => {
        if (null === e.dateObj || isNaN(e.amount)) return;
        const r = o(e.dateObj) + "|" + t(e.amount).toFixed(2);
        (a.has(r) || a.set(r, []), a.get(r).push({ row: e, idx: n, used: !1 }));
      }),
      e.map((e) => {
        if (null === e.dateObj || isNaN(e.amount))
          return {
            bank: e,
            register: null,
            tieBreak: !1,
            matchNote: "Bank row has an unparseable date or amount.",
          };
        const r = o(e.dateObj) + "|" + t(e.amount).toFixed(2),
          s = (a.get(r) || []).filter((e) => !e.used);
        if (0 === s.length)
          return {
            bank: e,
            register: null,
            tieBreak: !1,
            matchNote:
              "No MSO register line found for " +
              n(e.dateObj) +
              " / " +
              e.amount.toFixed(2) +
              ".",
          };
        if (1 === s.length)
          return (
            (s[0].used = !0),
            { bank: e, register: s[0].row, tieBreak: !1, matchNote: null }
          );
        let c = s[0],
          i = -1;
        for (const t of s) {
          const n = u(e.description, t.row.payee + " " + t.row.memo);
          n > i && ((i = n), (c = t));
        }
        return (
          (c.used = !0),
          {
            bank: e,
            register: c.row,
            tieBreak: !0,
            matchNote:
              s.length +
              " MSO register lines share this date & amount — matched by closest vendor/description text (verify).",
          }
        );
      })
    );
  }
  const g = {
    parseAmount: function (e) {
      if (null == e) return NaN;
      let t = String(e).trim();
      if ("" === t) return NaN;
      let n = !1;
      if (
        (/^\(.*\)$/.test(t) && ((n = !0), (t = t.slice(1, -1))),
        (t = t.replace(/[$,\s]/g, "")),
        t.endsWith("-") && ((n = !0), (t = t.slice(0, -1))),
        t.startsWith("-") && ((n = !0), (t = t.slice(1))),
        "" === t || isNaN(Number(t)))
      )
        return NaN;
      const o = Number(t);
      return n ? -o : o;
    },
    parseUSDate: function (e) {
      if (!e) return null;
      if (e instanceof Date) return isNaN(e) ? null : e;
      const t = String(e).trim();
      let n = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
      if (n) {
        let [, e, t, o] = n;
        return (
          (o = 2 === o.length ? "20" + o : o),
          new Date(Number(o), Number(e) - 1, Number(t))
        );
      }
      if (((n = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)), n))
        return new Date(Number(n[1]), Number(n[2]) - 1, Number(n[3]));
      const o = new Date(t);
      return isNaN(o) ? null : o;
    },
    fmtDate: n,
    dateKey: o,
    dateRange: function (e) {
      const t = e
        .map((e) => e.dateObj)
        .filter(Boolean)
        .sort((e, t) => e - t);
      return t.length
        ? {
            min: t[0],
            max: t[t.length - 1],
            label: n(t[0]) + " to " + n(t[t.length - 1]),
          }
        : { min: null, max: null, label: "" };
    },
    round2: t,
    norm: r,
    tokens: a,
    lastSegment: s,
    stripLeadingAcctNo: c,
    tokenOverlapScore: u,
    buildLookups: i,
    isIntercompanyAccount: m,
    lookupCategory: d,
    lookupClass: h,
    lookupVendor: p,
    resolveVendor: q,
    matchTransactions: f,
    process: function (e, t, n, o) {
      o = o || {};
      const { coaMap: r, classMap: a, vendorMap: s } = i(n),
        c = f(e, t),
        u = [],
        l = [];
      return (
        c.forEach((e) => {
          const t = e.bank;
          if (!e.register)
            return void l.push({
              date: t.date,
              bank: o.bankAccountLabel || "",
              bankDescription: t.description,
              amount: t.amount,
              registerPayee: "",
              registerMemo: "",
              registerAccount: "",
              reason: e.matchNote,
              partial: { payee: null, account: null, klass: null, memo: "" },
            });
          const n = e.register,
            c = d(n.account, r),
            i = q(
              n.payee,
              n.memo,
              s,
              (o.vendorMappings || []).concat(o.fixedVendorMappings || []),
            );
          let f,
            g = !1;
          c.ok && m(c.hnAccount)
            ? ((f = { ok: !0, cleaned: n.klass, hnClass: "Corporate" }),
              (g = !0))
            : (f = h(n.klass, a));
          const k = [];
          (c.ok || k.push(c.reason),
            f.ok || k.push(f.reason),
            i.ok || k.push(i.reason),
            k.length
              ? l.push({
                  date: t.date,
                  bank: o.bankAccountLabel || "",
                  bankDescription: t.description,
                  amount: t.amount,
                  registerPayee: n.payee,
                  registerMemo: n.memo,
                  registerAccount: n.account,
                  reason: k.join(" "),
                  vendorUnresolved: !i.ok,
                  partial: {
                    payee: i.ok ? i.hnVendor : null,
                    account: c.ok ? c.hnAccount : null,
                    klass: f.ok ? f.hnClass : null,
                    memo: n.memo || "",
                  },
                })
              : u.push({
                  date: t.date,
                  dateObj: t.dateObj,
                  payee: i.hnVendor,
                  account: c.hnAccount,
                  description: t.description,
                  amount: t.amount,
                  memo: n.memo || "",
                  klass: f.hnClass,
                  tieBreak: e.tieBreak,
                  forcedCorporate: g,
                  matchNote: e.matchNote,
                  registerPayee: n.payee,
                }));
        }),
        { imported: u, excluded: l }
      );
    },
    reconcile: function (e, t, n) {
      const o = e.reduce((e, t) => e + (isNaN(t.amount) ? 0 : t.amount), 0),
        r = t.reduce((e, t) => e + t.amount, 0),
        a = n.reduce((e, t) => e + (isNaN(t.amount) ? 0 : t.amount), 0);
      return {
        bankTotal: o,
        impTotal: r,
        excTotal: a,
        ok: Math.abs(o - (r + a)) < 0.005,
      };
    },
    aggregate: function (e, t, n) {
      const o = new Map();
      e.forEach((e) => {
        const n = e[t] || "(blank)";
        o.has(n) || o.set(n, { key: n, amount: 0, count: 0 });
        const r = o.get(n);
        ((r.amount += Math.abs(e.amount)), (r.count += 1));
      });
      const r = Array.from(o.values()).sort((e, t) => t.amount - e.amount);
      if (!n || r.length <= n) return r;
      const a = r.slice(0, n - 1),
        s = r
          .slice(n - 1)
          .reduce(
            (e, t) => ({
              key: "Other",
              amount: e.amount + t.amount,
              count: e.count + t.count,
            }),
            { key: "Other", amount: 0, count: 0 },
          );
      return (a.push(s), a);
    },
    aggregateReasons: function (e) {
      const t = new Map();
      return (
        e.forEach((e) => {
          const n =
            String(e.reason || "(no reason)")
              .split(".")[0]
              .trim() + ".";
          t.has(n) || t.set(n, { key: n, amount: 0, count: 0 });
          const o = t.get(n);
          ((o.amount += Math.abs(e.amount || 0)), (o.count += 1));
        }),
        Array.from(t.values()).sort((e, t) => t.count - e.count)
      );
    },
  };
  ("undefined" != typeof module && module.exports && (module.exports = g),
    (e.ExpCore = g));
})("undefined" != typeof self ? self : this);
