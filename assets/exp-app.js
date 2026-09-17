!(function () {
  "use strict";
  const t = (t) => document.getElementById(t),
    e = "expBankAccounts.v1",
    n = "expDashboardData.v1",
    o = {
      bankAccounts: [],
      selectedAccount: null,
      bankRows: null,
      registerRows: null,
      masterLists: {
        coa: ExpData.DEFAULT_COA,
        class: ExpData.DEFAULT_CLASS,
        vendor: ExpData.DEFAULT_VENDOR,
      },
      qboColumns: ExpData.DEFAULT_QBO_COLUMNS.slice(),
      result: null,
      dateLabel: "",
      fmt2: (t) =>
        isNaN(t)
          ? ""
          : Number(t).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
    };
  const VENDOR_MAPPING_KEY = "hnBankConfirmedVendorMappings.v1";
  function P() {
    try {
      const t = JSON.parse(localStorage.getItem(VENDOR_MAPPING_KEY) || "[]");
      return Array.isArray(t) ? t : [];
    } catch (t) {
      return [];
    }
  }
  function T(t) {
    if (!t || !t.hnVendor) return;
    const e = String(t.msoPayee || "").trim(),
      n = String(t.msoMemo || "").trim();
    if (!e && !n) return;
    const a = P(),
      r = ExpCore.norm(e),
      s = ExpCore.norm(n),
      c = a.findIndex(
        (t) =>
          ExpCore.norm(t.msoPayee) === r && ExpCore.norm(t.msoMemo) === s,
      ),
      l = {
        msoPayee: e,
        msoMemo: n,
        hnVendor: t.hnVendor,
        source: "confirmed",
      };
    (c >= 0 ? (a[c] = l) : a.push(l),
      localStorage.setItem(VENDOR_MAPPING_KEY, JSON.stringify(a)));
  }
  function a(t, e, n) {
    const o = new FileReader();
    ((o.onload = (t) => {
      try {
        const n = XLSX.read(t.target.result, { type: "array" }),
          o = n.Sheets[n.SheetNames[0]],
          a = XLSX.utils.sheet_to_json(o, { header: 1, raw: !1, defval: "" });
        e(a.filter((t) => t.some((t) => "" !== String(t).trim())));
      } catch (t) {
        n(t);
      }
    }),
      (o.onerror = () => n(new Error("Could not read the file."))),
      o.readAsArrayBuffer(t));
  }
  function r(t, e, n) {
    if ("csv" === t.name.split(".").pop().toLowerCase()) {
      const o = new FileReader();
      ((o.onload = (t) =>
        e(
          (function (t) {
            const e = [];
            let n = [],
              o = "",
              a = 0,
              r = !1;
            for (; a < t.length; ) {
              const s = t[a];
              if (r) {
                if ('"' === s) {
                  if ('"' === t[a + 1]) {
                    ((o += '"'), (a += 2));
                    continue;
                  }
                  ((r = !1), a++);
                  continue;
                }
                ((o += s), a++);
              } else
                '"' !== s
                  ? "," !== s
                    ? "\r" !== s
                      ? "\n" !== s
                        ? ((o += s), a++)
                        : (n.push(o), e.push(n), (n = []), (o = ""), a++)
                      : a++
                    : (n.push(o), (o = ""), a++)
                  : ((r = !0), a++);
            }
            return (
              (o.length || n.length) && (n.push(o), e.push(n)),
              e.filter((t) => t.some((t) => "" !== String(t).trim()))
            );
          })(t.target.result),
        )),
        (o.onerror = () => n(new Error("Could not read the CSV file."))),
        o.readAsText(t));
    } else a(t, e, n);
  }
  function s(t, e) {
    const n = t.map((t) => String(t).trim().toLowerCase());
    for (const t of e) {
      const e = n.findIndex((e) => e === t);
      if (-1 !== e) return e;
    }
    for (const t of e) {
      const e = n.findIndex((e) => -1 !== e.indexOf(t));
      if (-1 !== e) return e;
    }
    return -1;
  }
  function c(t, e, n) {
    const o = Math.min(t.length, 15);
    for (let a = 0; a < o; a++) {
      const o = (t[a] || []).map((t) =>
        String(t || "")
          .trim()
          .toLowerCase(),
      );
      let r = 0;
      for (const t of e) t.some((t) => o.includes(t)) && r++;
      if (r >= n) return a;
    }
    return 0;
  }
  function l() {
    let t = [];
    try {
      t = JSON.parse(localStorage.getItem(e) || "[]");
    } catch (e) {
      t = [];
    }
    const n = new Set();
    return ExpData.DEFAULT_BANK_ACCOUNTS.concat(t).filter((t) => {
      const e = (t.code || "") + "|" + t.name;
      return !n.has(e) && (n.add(e), !0);
    });
  }
  function i() {
    const e = t("acctSelect");
    ((e.innerHTML =
      '<option value="">— select bank / CC account —</option>' +
      o.bankAccounts
        .map((t, e) => '<option value="' + e + '">' + x(t.label) + "</option>")
        .join("")),
      (e.value = ""));
  }
  function d() {
    const n = window.prompt(
      "Account number (from your Chart of Accounts, e.g. 10015). Leave blank if none:",
      "",
    );
    if (null === n) return;
    const a = window.prompt(
      'Account name (e.g. "Hlthnmc Billpay FS 7843" or "Capital One Credit Card"):',
      "",
    );
    if (null === a || !a.trim()) return;
    const r = (n.trim() ? n.trim() + " · " : "") + a.trim();
    (!(function (t) {
      let n = [];
      try {
        n = JSON.parse(localStorage.getItem(e) || "[]");
      } catch (t) {
        n = [];
      }
      (n.push(t), localStorage.setItem(e, JSON.stringify(n)));
    })({ code: n.trim(), name: a.trim(), type: "Bank/CC", label: r }),
      (o.bankAccounts = l()),
      i());
    const s = o.bankAccounts.findIndex((t) => t.label === r);
    -1 !== s && ((t("acctSelect").value = s), u());
  }
  function u() {
    const e = t("acctSelect").value;
    o.selectedAccount = "" === e ? null : o.bankAccounts[parseInt(e, 10)];
    const n = t("acctBadge");
    (o.selectedAccount
      ? ((n.textContent = "✓ " + o.selectedAccount.label),
        n.classList.remove("hidden"))
      : n.classList.add("hidden"),
      g());
  }
  function m(e) {
    ((t("bankFileName").textContent = "✓ " + e.name),
      r(
        e,
        (t) => {
          try {
            ((o.bankRows = (function (t) {
              if (!t.length)
                throw new Error("The bank file appears to be empty.");
              const e = c(
                  t,
                  [
                    ["date", "posted date", "transaction date"],
                    [
                      "description",
                      "full description",
                      "details",
                      "transaction description",
                    ],
                    ["amount", "value", "transaction amount"],
                  ],
                  2,
                ),
                n = t[e],
                o = s(n, ["posted date", "date"]),
                a = s(n, [
                  "full description",
                  "description",
                  "details",
                  "memo",
                ]),
                r = s(n, ["amount", "value"]);
              if (-1 === o || -1 === a || -1 === r)
                throw new Error(
                  "Could not find Date/Description/Amount columns in the bank file. Found: " +
                    n.join(", "),
                );
              const l = [];
              for (let n = e + 1; n < t.length; n++) {
                const e = t[n],
                  s = (e[o] ?? "").toString().trim(),
                  c = (e[a] ?? "").toString().trim(),
                  i = (e[r] ?? "").toString().trim();
                if ("" === s && "" === c && "" === i) continue;
                const d = ExpCore.parseAmount(i);
                l.push({
                  date: s,
                  dateObj: ExpCore.parseUSDate(s),
                  description: c,
                  amount: d,
                });
              }
              return l;
            })(t)),
              b(""));
          } catch (t) {
            ((o.bankRows = null), b(t.message));
          }
          g();
        },
        (t) => {
          ((o.bankRows = null), b(t.message), g());
        },
      ));
  }
  function p(e) {
    ((t("regFileName").textContent = "✓ " + e.name),
      r(
        e,
        (t) => {
          try {
            ((o.registerRows = (function (t) {
              if (!t.length)
                throw new Error("The MSO register file appears to be empty.");
              const e = c(
                  t,
                  [
                    ["date"],
                    ["payee"],
                    ["memo"],
                    ["class"],
                    ["account"],
                    ["payment"],
                    ["deposit"],
                    ["charge/payment"],
                  ],
                  3,
                ),
                n = t[e],
                o = s(n, ["date"]),
                a = s(n, ["payee"]),
                r = s(n, ["memo"]),
                l = s(n, ["class"]),
                i = s(n, ["account"]),
                d = s(n, ["payment"]),
                u = s(n, ["deposit"]),
                v = s(n, ["charge"]),
                m = s(n, ["charge/payment", "amount"]);
              if (-1 === o || -1 === a || -1 === i)
                throw new Error(
                  "Could not find Date/Payee/Account columns in the MSO register file. Found: " +
                    n.join(", "),
                );
              if (-1 === d && -1 === u && -1 === v && -1 === m)
                throw new Error(
                  "Could not find Charge/Payment, Payment/Deposit, or Amount columns in the MSO register file.",
                );
              const p = [];
              for (let n = e + 1; n < t.length; n++) {
                const e = t[n],
                  s = (e[o] ?? "").toString().trim(),
                  c = (e[a] ?? "").toString().trim(),
                  h = -1 === r ? "" : (e[r] ?? "").toString().trim(),
                  f = -1 === l ? "" : (e[l] ?? "").toString().trim(),
                  g = (e[i] ?? "").toString().trim();
                let b;
                if (-1 !== v && -1 !== d) {
                  // Credit-card style register: Charge = money out (-), Payment = money in (+).
                  const t = (e[v] ?? "").toString().trim(),
                    n = (e[d] ?? "").toString().trim();
                  b =
                    "" !== t
                      ? -Math.abs(ExpCore.parseAmount(t))
                      : "" !== n
                        ? Math.abs(ExpCore.parseAmount(n))
                        : NaN;
                } else if (-1 !== d || -1 !== u) {
                  // Bank style register: Payment = money out (-), Deposit = money in (+).
                  const t = -1 === d ? "" : (e[d] ?? "").toString().trim(),
                    n = -1 === u ? "" : (e[u] ?? "").toString().trim();
                  b =
                    "" !== t
                      ? -Math.abs(ExpCore.parseAmount(t))
                      : "" !== n
                        ? Math.abs(ExpCore.parseAmount(n))
                        : NaN;
                } else if (-1 !== v) {
                  const t = (e[v] ?? "").toString().trim();
                  b = "" !== t ? -Math.abs(ExpCore.parseAmount(t)) : NaN;
                } else b = ExpCore.parseAmount(e[m]);
                ("" === s && "" === c && "" === g) ||
                  p.push({
                    date: s,
                    dateObj: ExpCore.parseUSDate(s),
                    payee: c,
                    memo: h,
                    klass: f,
                    account: g,
                    amount: b,
                  });
              }
              return p;
            })(t)),
              b(""));
          } catch (t) {
            ((o.registerRows = null), b(t.message));
          }
          g();
        },
        (t) => {
          ((o.registerRows = null), b(t.message), g());
        },
      ));
  }
  function h(e) {
    ((t("masterFileName").textContent = "✓ " + e.name),
      (function (t, e, n) {
        const o = new FileReader();
        ((o.onload = (t) => {
          try {
            const n = XLSX.read(t.target.result, { type: "array" }),
              o = {};
            (n.SheetNames.forEach((t) => {
              o[t] = XLSX.utils
                .sheet_to_json(n.Sheets[t], { header: 1, raw: !1, defval: "" })
                .filter((t) => t.some((t) => "" !== String(t).trim()));
            }),
              e(o));
          } catch (t) {
            n(t);
          }
        }),
          (o.onerror = () => n(new Error("Could not read the file."))),
          o.readAsArrayBuffer(t));
      })(
        e,
        (t) => {
          try {
            ((o.masterLists = (function (t) {
              const e = Object.keys(t),
                n = (t) => e.find((e) => -1 !== e.toLowerCase().indexOf(t)),
                o = n("coa"),
                a = n("class"),
                r = n("vendor");
              if (!o || !a || !r)
                throw new Error(
                  'Master lists workbook needs three tabs with "COA", "class" and "vendor" in their names. Found: ' +
                    e.join(", "),
                );
              return {
                coa: (function (t) {
                  const e = c(
                      t,
                      [
                        ["mso acct #", "mso acct"],
                        ["mso base category", "category"],
                        ["hn acct #", "hn acct"],
                        ["hn account used", "hn account"],
                      ],
                      2,
                    ),
                    n = t[e],
                    o = s(n, ["mso acct #", "mso acct"]),
                    a = s(n, ["mso base category", "category"]),
                    r = s(n, ["hn acct #", "hn acct"]),
                    l = s(n, ["hn account used", "hn account"]),
                    i = [];
                  for (let n = e + 1; n < t.length; n++) {
                    const e = t[n],
                      s = (e[a] ?? "").toString().trim(),
                      c = -1 === l ? "" : (e[l] ?? "").toString().trim();
                    if (!s && !c) continue;
                    const d = -1 === o ? "" : (e[o] ?? "").toString().trim(),
                      u = -1 === r ? "" : (e[r] ?? "").toString().trim();
                    i.push({
                      msoAcct: d ? parseInt(d, 10) : null,
                      msoCategory: s,
                      hnAcct: u ? parseInt(u, 10) : null,
                      hnAccount: c,
                    });
                  }
                  return i;
                })(t[o]),
                class: (function (t) {
                  const e = c(
                      t,
                      [["mso class"], ["hn class to use", "hn class"]],
                      1,
                    ),
                    n = t[e],
                    o = s(n, ["mso class"]),
                    a = s(n, ["hn class to use", "hn class"]),
                    r = [];
                  for (let n = e + 1; n < t.length; n++) {
                    const e = t[n],
                      s = (e[o] ?? "").toString().trim(),
                      c = -1 === a ? "" : (e[a] ?? "").toString().trim();
                    (s || c) && r.push({ msoClass: s, hnClass: c });
                  }
                  return r;
                })(t[a]),
                vendor: (function (t) {
                  const e = c(
                      t,
                      [["mso vendor"], ["hn vendor (mapped)", "hn vendor"]],
                      1,
                    ),
                    n = t[e],
                    o = s(n, ["mso vendor"]),
                    a = s(n, ["hn vendor (mapped)", "hn vendor"]),
                    r = [];
                  for (let n = e + 1; n < t.length; n++) {
                    const e = t[n],
                      s = (e[o] ?? "").toString().trim(),
                      c = -1 === a ? "" : (e[a] ?? "").toString().trim();
                    (s || c) && r.push({ msoVendor: s, hnVendor: c });
                  }
                  return r;
                })(t[r]),
              };
            })(t)),
              b(""));
          } catch (t) {
            ((o.masterLists = {
              coa: ExpData.DEFAULT_COA,
              class: ExpData.DEFAULT_CLASS,
              vendor: ExpData.DEFAULT_VENDOR,
            }),
              b(t.message));
          }
        },
        (t) => b(t.message),
      ));
  }
  function f(e) {
    ((t("templateFileName").textContent = "✓ " + e.name),
      a(
        e,
        (t) => {
          try {
            ((o.qboColumns = (function (t) {
              if (!t.length) throw new Error("QBO template file is empty.");
              const e = t[0]
                .map((t) => String(t).trim())
                .filter((t) => "" !== t);
              if (!e.length)
                throw new Error(
                  "Could not find a header row in the QBO template file.",
                );
              return e;
            })(t)),
              b(""));
          } catch (t) {
            ((o.qboColumns = ExpData.DEFAULT_QBO_COLUMNS.slice()),
              b(t.message));
          }
        },
        (t) => b(t.message),
      ));
  }
  function g() {
    const e =
      o.selectedAccount &&
      o.bankRows &&
      o.bankRows.length &&
      o.registerRows &&
      o.registerRows.length;
    ((t("processBtn").disabled = !e),
      (t("readyHint").textContent = e
        ? o.bankRows.length +
          " bank rows · " +
          o.registerRows.length +
          " register rows for " +
          o.selectedAccount.label
        : "Select an account and upload both files to enable."));
  }
  function b(e) {
    const n = t("errBox");
    if (!e) return (n.classList.add("hidden"), void (n.textContent = ""));
    (n.classList.remove("hidden"), (n.textContent = "⚠ " + e));
  }
  function C() {
    b("");
    const e = o.selectedAccount.label,
      { imported: n, excluded: a } = ExpCore.process(
        o.bankRows,
        o.registerRows,
        o.masterLists,
        {
          bankAccountLabel: e,
          vendorMappings: P(),
          fixedVendorMappings: ExpData.FIXED_VENDOR_MAPPINGS || [],
        },
      );
    ((o.dateLabel = ExpCore.dateRange(o.bankRows).label),
      (o.result = { imported: n, excluded: a }),
      (t("confirmCheck").checked = !1),
      y(),
      t("resultsCard").classList.remove("hidden"),
      t("resultsCard").scrollIntoView({ behavior: "smooth", block: "start" }));
  }
  function w() {
    return {
      payees: Array.from(
        new Set(
          (o.masterLists.vendor || []).map((t) => t.hnVendor).filter(Boolean),
        ),
      ).sort((t, e) => t.localeCompare(e)),
      accounts: Array.from(
        new Set(
          (o.masterLists.coa || [])
            .filter((t) => "(NEEDS REVIEW)" !== ExpCore.norm(t.hnAccount))
            .map((t) => (t.hnAcct ? t.hnAcct + " " + t.hnAccount : t.hnAccount))
            .filter(Boolean),
        ),
      ).sort((t, e) => t.localeCompare(e)),
      classes: Array.from(
        new Set(
          (o.masterLists.class || []).map((t) => t.hnClass).filter(Boolean),
        ),
      ).sort((t, e) => t.localeCompare(e)),
    };
  }
  function A(t, e, n, o) {
    return (
      '<select class="' +
      t +
      '" ' +
      e +
      '><option value="">— select —</option>' +
      n
        .map(
          (t) =>
            "<option" + (t === o ? " selected" : "") + ">" + x(t) + "</option>",
        )
        .join("") +
      "</select>"
    );
  }
  function y() {
    const e = o.result,
      a = ExpCore.reconcile(o.bankRows, e.imported, e.excluded);
    t("tiles").innerHTML = [
      k("Rows categorized", e.imported.length),
      k(
        "Categorized total",
        "$" + o.fmt2(e.imported.reduce((t, e) => t + e.amount, 0)),
        "good",
      ),
      k("Needs review", e.excluded.length, e.excluded.length ? "warnv" : ""),
      k("Reconciles", a.ok ? "OK" : "MISMATCH", a.ok ? "good" : "warnv"),
    ].join("");
    (t("reconCheckpoint").classList.toggle("pass", a.ok),
      (t("reconText").innerHTML =
        "Bank file total <b>" +
        o.fmt2(a.bankTotal) +
        "</b> = QBO Import <b>" +
        o.fmt2(a.impTotal) +
        "</b> + Needs Review <b>" +
        o.fmt2(a.excTotal) +
        '</b> &rarr; <span class="badge ' +
        (a.ok ? 'ok">✓ OK' : 'bad">✗ MISMATCH') +
        "</span>"),
      (t("impCnt").textContent = e.imported.length),
      (t("revCnt").textContent = e.excluded.length),
      t("tabBtnReview").classList.toggle("warn", e.excluded.length > 0),
      (function () {
        const e = o.result;
        t("procCount").textContent = e.imported.length;
        const n = w();
        let a =
          '<thead><tr><th>Date</th><th>Payee</th><th>Account</th><th>Description</th><th class="num">Amount</th><th>Memo</th><th>Class</th><th>Flags</th></tr></thead><tbody>';
        (e.imported.forEach((t, e) => {
          const r =
            (t.tieBreak
              ? '<span class="flag tie" title="' +
                x(t.matchNote || "") +
                '">tie-break</span>'
              : "") +
            (t.forcedCorporate
              ? '<span class="flag corp" title="Intercompany Due (to)/from Related Party — Class forced to Corporate">intercompany</span>'
              : "");
          a +=
            "<tr><td>" +
            x(t.date) +
            "</td><td>" +
            A(
              "impSel impPayee",
              'data-idx="' + e + '" data-field="payee"',
              n.payees,
              t.payee,
            ) +
            "</td><td>" +
            A(
              "impSel impAccount",
              'data-idx="' + e + '" data-field="account"',
              n.accounts,
              t.account,
            ) +
            "</td><td>" +
            x(t.description) +
            '</td><td class="num">' +
            o.fmt2(t.amount) +
            "</td><td>" +
            x(t.memo) +
            "</td><td>" +
            A(
              "impSel impClass",
              'data-idx="' + e + '" data-field="klass"',
              n.classes,
              t.klass,
            ) +
            "</td><td>" +
            r +
            "</td></tr>";
        }),
          (a += "</tbody>"),
          (t("procTable").innerHTML = a),
          Array.prototype.forEach.call(
            document.querySelectorAll(".impSel"),
            (t) => {
              t.addEventListener("change", function () {
                const t = parseInt(this.getAttribute("data-idx"), 10),
                  e = this.getAttribute("data-field");
                o.result.imported[t][e] = this.value;
              });
            },
          ));
      })(),
      (function () {
        const e = o.result;
        t("npCount").textContent = e.excluded.length;
        const n = w();
        let a =
          '<thead><tr><th>Date</th><th>Bank Description</th><th class="num">Amount</th><th>MSO Payee</th><th>MSO Memo</th><th>MSO Account</th><th>Reason</th><th>Payee</th><th>Account</th><th>Class</th><th></th></tr></thead><tbody>';
        (e.excluded.forEach((t, e) => {
          const r = t.partial || {};
          a +=
            '<tr class="needs" data-row="' +
            e +
            '"><td>' +
            x(t.date) +
            "</td><td>" +
            x(t.bankDescription) +
            '</td><td class="num">' +
            o.fmt2(t.amount) +
            "</td><td>" +
            x(t.registerPayee) +
            "</td><td>" +
            x(t.registerMemo) +
            "</td><td>" +
            x(t.registerAccount) +
            '</td><td class="reason">' +
            x(t.reason) +
            "</td><td>" +
            A(
              "revSel",
              'data-row="' + e + '" data-field="payee"',
              n.payees,
              r.payee,
            ) +
            "</td><td>" +
            A(
              "revSel",
              'data-row="' + e + '" data-field="account"',
              n.accounts,
              r.account,
            ) +
            "</td><td>" +
            A(
              "revSel",
              'data-row="' + e + '" data-field="klass"',
              n.classes,
              r.klass,
            ) +
            '</td><td><button class="mini-btn" data-row="' +
            e +
            '" data-act="include">Include</button></td></tr>';
        }),
          (a += "</tbody>"),
          (t("npTable").innerHTML = a),
          Array.prototype.forEach.call(
            document.querySelectorAll(".revSel"),
            (t) => {
              t.addEventListener("change", function () {
                const t = parseInt(this.getAttribute("data-row"), 10),
                  e = this.getAttribute("data-field");
                (o.result.excluded[t].partial ||
                  (o.result.excluded[t].partial = {}),
                  (o.result.excluded[t].partial[e] = this.value || null));
              });
            },
          ),
          Array.prototype.forEach.call(
            document.querySelectorAll('[data-act="include"]'),
            (t) => {
              t.addEventListener("click", function () {
                !(function (t) {
                  const e = o.result.excluded[t],
                    n = e.partial || {};
                  if (!n.payee || !n.account || !n.klass)
                    return void b(
                      "Pick a Payee, Account and Class for this row before including it.",
                    );
                  (b(""),
                    e.vendorUnresolved &&
                      T({
                        msoPayee: e.registerPayee || "",
                        msoMemo: e.registerMemo || "",
                        hnVendor: n.payee,
                      }),
                    o.result.imported.push({
                      date: e.date,
                      payee: n.payee,
                      account: n.account,
                      description: e.bankDescription,
                      amount: e.amount,
                      memo: n.memo || e.registerMemo || "",
                      klass: n.klass,
                      tieBreak: !1,
                      forcedCorporate: !1,
                      matchNote: "Manually resolved from Needs Review",
                    }),
                    o.result.excluded.splice(t, 1),
                    y());
                })(parseInt(this.getAttribute("data-row"), 10));
              });
            },
          ));
      })(),
      S(),
      (function () {
        const t = o.result;
        if (!t) return;
        const e = ExpCore.reconcile(o.bankRows, t.imported, t.excluded),
          a = {
            bankAccountLabel: o.selectedAccount ? o.selectedAccount.label : "",
            dateLabel: o.dateLabel,
            builtAt: Date.now(),
            reconciliation: e,
            imported: t.imported.map((t) => ({
              date: t.date,
              payee: t.payee,
              account: t.account,
              amount: t.amount,
              klass: t.klass,
              tieBreak: !!t.tieBreak,
              forcedCorporate: !!t.forcedCorporate,
            })),
            excluded: t.excluded.map((t) => ({
              date: t.date,
              amount: t.amount,
              reason: t.reason,
            })),
          };
        try {
          localStorage.setItem(n, JSON.stringify(a));
        } catch (t) {}
      })());
  }
  function S() {
    const e = ExpCore.reconcile(
        o.bankRows,
        o.result.imported,
        o.result.excluded,
      ),
      n = t("confirmCheck").checked,
      a = t("downloadBtn"),
      r = t("dlBadge");
    ((a.disabled = !(n && e.ok)),
      e.ok
        ? n
          ? ((r.className = "badge ok"),
            (r.textContent = "✓ Ready to download"))
          : ((r.className = "badge bad"),
            (r.textContent = "Confirm checkpoint 2 to enable download"))
        : ((r.className = "badge bad"),
          (r.textContent = "✗ Reconciliation mismatch — cannot download")));
  }
  function k(t, e, n) {
    return (
      '<div class="tile ' +
      (n || "") +
      '"><div class="k">' +
      t +
      '</div><div class="v">' +
      e +
      "</div></div>"
    );
  }
  function x(t) {
    return String(null == t ? "" : t).replace(
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
  }
  async function v() {
    try {
      const t = o.result,
        e = ExpCore.reconcile(o.bankRows, t.imported, t.excluded),
        n = ExpXlsx.buildWorkbook(
          ExcelJS,
          { imported: t.imported, excluded: t.excluded },
          {
            qboColumns: o.qboColumns,
            masterLists: o.masterLists,
            bankAccountLabel: o.selectedAccount.label,
            dateLabel: o.dateLabel,
            reconciliation: e,
            vendorMappings: P(),
            fixedVendorMappings: ExpData.FIXED_VENDOR_MAPPINGS || [],
          },
        ),
        a = await n.xlsx.writeBuffer(),
        r = new Blob([a], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        s = (o.dateLabel || "").replace(/\//g, "-").replace(/\s+/g, ""),
        c =
          (
            (o.selectedAccount.code ? o.selectedAccount.code + "_" : "") +
            o.selectedAccount.name
          ).replace(/[^\w\-]+/g, "_") +
          "_QBO_Expense_Import_" +
          (s || "export") +
          ".xlsx",
        l = URL.createObjectURL(r),
        i = document.createElement("a");
      ((i.href = l),
        (i.download = c),
        document.body.appendChild(i),
        i.click(),
        setTimeout(() => {
          (URL.revokeObjectURL(l), i.remove());
        }, 1e3));
    } catch (t) {
      b("Could not build the workbook: " + t.message);
    }
  }
  function L(e, n, o) {
    const a = t(e);
    (t(n).addEventListener("change", (t) => {
      t.target.files[0] && o(t.target.files[0]);
    }),
      ["dragover", "dragenter"].forEach((t) =>
        a.addEventListener(t, (t) => {
          (t.preventDefault(), a.classList.add("dragover"));
        }),
      ),
      ["dragleave", "drop"].forEach((t) =>
        a.addEventListener(t, (t) => {
          (t.preventDefault(), a.classList.remove("dragover"));
        }),
      ),
      a.addEventListener("drop", (t) => {
        t.dataTransfer.files[0] && o(t.dataTransfer.files[0]);
      }));
  }
  function E() {
    ((o.bankAccounts = l()),
      i(),
      t("acctSelect").addEventListener("change", u),
      t("addAcctBtn").addEventListener("click", d),
      L("dropBank", "bankInput", m),
      L("dropReg", "regInput", p),
      L("dropMaster", "masterInput", h),
      L("dropTemplate", "templateInput", f),
      t("processBtn").addEventListener("click", C),
      t("confirmCheck").addEventListener("change", S),
      t("downloadBtn").addEventListener("click", v),
      Array.prototype.forEach.call(
        document.querySelectorAll(".tabbtn"),
        (e) => {
          e.addEventListener("click", function () {
            const e = this.getAttribute("data-tab");
            (Array.prototype.forEach.call(
              document.querySelectorAll(".tabbtn"),
              (t) => t.classList.toggle("active", t === this),
            ),
              t("panelImport").classList.toggle("active", "import" === e),
              t("panelReview").classList.toggle("active", "review" === e));
          });
        },
      ));
  }
  "loading" === document.readyState
    ? document.addEventListener("DOMContentLoaded", E)
    : E();
})();
