!(function (e) {
  "use strict";
  const t = "FF1F3864";
  function o() {
    return {
      top: { style: "thin", color: { argb: "FFBFBFBF" } },
      left: { style: "thin", color: { argb: "FFBFBFBF" } },
      bottom: { style: "thin", color: { argb: "FFBFBFBF" } },
      right: { style: "thin", color: { argb: "FFBFBFBF" } },
    };
  }
  function a(e, a, n) {
    const l = e.getRow(a);
    for (let e = 1; e <= n; e++) {
      const a = l.getCell(e);
      ((a.fill = { type: "pattern", pattern: "solid", fgColor: { argb: t } }),
        (a.font = {
          name: "Arial",
          size: 10,
          bold: !0,
          color: { argb: "FFFFFFFF" },
        }),
        (a.alignment = { vertical: "middle", horizontal: "left" }),
        (a.border = o()));
    }
    l.height = 20;
  }
  function n(e, t, a, n) {
    for (let l = t; l <= a; l++) {
      const a = e.getRow(l),
        r = (l - t) % 2 == 1;
      for (let e = 1; e <= n; e++) {
        const t = a.getCell(e);
        ((t.font = { name: "Arial", size: 10 }),
          (t.border = o()),
          r &&
            (t.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFD9E1F2" },
            }),
          (t.alignment = Object.assign({ vertical: "middle" }, t.alignment)));
      }
    }
  }
  function l(e) {
    return Array.from(new Set(e.filter((e) => null != e && "" !== e))).sort(
      (e, t) => String(e).localeCompare(String(t)),
    );
  }
  const r = {
    date: "date",
    payee: "payee",
    account: "account",
    description: "description",
    amount: "amount",
    memo: "memo",
    class: "klass",
  };
  function s(e) {
    return isNaN(e)
      ? ""
      : Number(e).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  }
  const i = {
    buildWorkbook: function (e, o, i) {
      i = i || {};
      const c = new e.Workbook();
      ((c.creator = "GATP HN Bank Expense Categorization"),
        (c.created = new Date()));
      const d = o.imported,
        m = o.excluded,
        u = d.length,
        g = m.length,
        h =
          i.qboColumns && i.qboColumns.length
            ? i.qboColumns
            : [
                "Date",
                "Payee",
                "Account",
                "Description",
                "Amount",
                "Memo",
                "Class",
              ],
        p = h.map((e) => r[String(e).trim().toLowerCase()] || null),
        f = l((i.masterLists.vendor || []).map((e) => e.hnVendor)),
        b = l(
          (i.masterLists.coa || []).map((e) =>
            e.hnAcct ? e.hnAcct + " " + e.hnAccount : e.hnAccount,
          ),
        ),
        w = l((i.masterLists.class || []).map((e) => e.hnClass)),
        C = c.addWorksheet("Lists", { state: "veryHidden" });
      ((C.getCell("A1").value = "HN Payee"),
        (C.getCell("B1").value = "HN Account"),
        (C.getCell("C1").value = "HN Class"),
        f.forEach((e, t) => {
          C.getCell(t + 2, 1).value = e;
        }),
        b.forEach((e, t) => {
          C.getCell(t + 2, 2).value = e;
        }),
        w.forEach((e, t) => {
          C.getCell(t + 2, 3).value = e;
        }));
      const vendorMappings = (function () {
          // Saved (confirmed) + fixed mappings first.
          const list = (i.vendorMappings || []).concat(
              i.fixedVendorMappings || [],
            ),
            normKey = (x) =>
              String(x || "")
                .trim()
                .toLowerCase()
                .replace(/\s+/g, " "),
            seen = new Set(
              list.map(
                (e) =>
                  normKey(e.msoPayee || e.msoMemo || e.memoContains) +
                  "|" +
                  normKey(e.hnVendor),
              ),
            );
          // Then every MSO Payee -> HN Vendor mapping actually used in this run.
          (d || []).forEach((r) => {
            if (!r || !r.payee) return;
            const msoPayee = String(r.registerPayee || "").trim(),
              msoMemo = msoPayee ? "" : String(r.memo || "").trim(),
              // blank MSO Payee: one row per vendor (memo shown as an example)
              k = msoPayee
                ? normKey(msoPayee) + "|" + normKey(r.payee)
                : "memo|" + normKey(r.payee);
            if (!msoPayee && !msoMemo) return;
            if (seen.has(k)) return;
            seen.add(k);
            list.push({
              msoPayee: msoPayee,
              msoMemo: msoMemo,
              memoContains: "",
              hnVendor: r.payee,
              source: "auto (this run)",
            });
          });
          return list;
        })(),
        V = c.addWorksheet("Vendor Mappings", {
          views: [{ state: "frozen", ySplit: 1, showGridLines: !1 }],
        }),
        VH = [
          "MSO Payee",
          "MSO Memo",
          "Memo Contains",
          "Mapped Vendor",
          "Source",
        ];
      (V.addRow(VH),
        (V.columns = [
          { width: 28 },
          { width: 42 },
          { width: 28 },
          { width: 30 },
          { width: 16 },
        ]),
        vendorMappings.forEach((e) => {
          V.addRow([
            e.msoPayee || "",
            e.msoMemo || "",
            e.memoContains || "",
            e.hnVendor || "",
            e.source || "fixed",
          ]);
        }),
        a(V, 1, VH.length),
        vendorMappings.length >= 1 && n(V, 2, vendorMappings.length + 1, VH.length));
      const y = `Lists!$A$2:$A$${Math.max(f.length + 1, 2)}`,
        k = `Lists!$B$2:$B$${Math.max(b.length + 1, 2)}`,
        F = `Lists!$C$2:$C$${Math.max(w.length + 1, 2)}`,
        B = c.addWorksheet("QBO Import", {
          views: [{ state: "frozen", ySplit: 1, showGridLines: !1 }],
        });
      B.columns = h.map((e) => {
        const t = String(e).trim().toLowerCase();
        return {
          width:
            "description" === t
              ? 30
              : "memo" === t
                ? 28
                : "account" === t
                  ? 26
                  : "payee" === t
                    ? 24
                    : "class" === t
                      ? 20
                      : 14,
        };
      });
      const v = d.map((e) => p.map((t) => (t ? e[t] : "")));
      (B.addTable({
        name: "QBOImport",
        ref: "A1",
        headerRow: !0,
        totalsRow: !1,
        style: { theme: "TableStyleMedium2", showRowStripes: !0 },
        columns: h.map((e) => ({ name: e })),
        rows: v.length ? v : [h.map(() => "")],
      }),
        v.length || B.spliceRows(2, 1),
        h.forEach((e, t) => {
          const o = String(e).trim().toLowerCase(),
            a = t + 1;
          for (let e = 2; e <= u + 1; e++) {
            const t = B.getRow(e).getCell(a);
            ("amount" === o &&
              ((t.numFmt = "#,##0.00"),
              // store Amount as a real number so the TOTAL SUM works
              null != t.value &&
                "" !== t.value &&
                !isNaN(Number(t.value)) &&
                (t.value = Number(t.value))),
              ("description" !== o && "memo" !== o) ||
                ((t.numFmt = "@"),
                (t.value = String(null == t.value ? "" : t.value))));
          }
          // One dropdown rule per column range (per-cell rules made ExcelJS
          // write overlapping ranges, which Excel reports as a file problem).
          const dvFormula =
            "payee" === o ? y : "account" === o ? k : "class" === o ? F : null;
          if (dvFormula && u >= 1) {
            const col = B.getColumn(a).letter;
            B.dataValidations.add(`${col}2:${col}${u + 1}`, {
              type: "list",
              allowBlank: !0,
              formulae: [dvFormula],
            });
          }
        }));
      const A =
        h.findIndex((e) => "amount" === String(e).trim().toLowerCase()) + 1;
      if (u >= 1 && A) {
        const e = B.getRow(u + 3);
        ((e.getCell(Math.max(A - 1, 1)).value = "TOTAL"),
          (e.getCell(Math.max(A - 1, 1)).font = {
            name: "Arial",
            size: 10,
            bold: !0,
          }));
        const t = B.getColumn(A).letter;
        ((e.getCell(A).value = { formula: `SUM(${t}2:${t}${u + 1})` }),
          (e.getCell(A).numFmt = "#,##0.00"),
          (e.getCell(A).font = { name: "Arial", size: 10, bold: !0 }),
          (e.getCell(A).border = {
            top: { style: "double" },
            bottom: { style: "double" },
          }));
      }
      (a(B, 1, h.length), u >= 1 && n(B, 2, u + 1, h.length));
      const S = d.filter((e) => e.tieBreak).length,
        x = d.filter((e) => e.forcedCorporate).length;
      // NOTE: this used to be a cell comment on QBO Import!A1, but ExcelJS
      // writes comments + tables in an order Excel rejects ("We found a
      // problem with some content"). The text now goes on the Read Me tab.
      let reviewNote = [];
      if (S || x) {
        reviewNote = [
          S
            ? `${S} row(s) matched a bank transaction to one of several MSO register lines sharing the same date & amount (matched by closest vendor/description text — verify).`
            : null,
          x
            ? `${x} row(s) are Intercompany Due (to)/from Related Party accounts (Battleborn, Sagebrush, etc.) — Class forced to "Corporate" regardless of the MSO register's own Class.`
            : null,
        ]
          .filter(Boolean);
      }
      const M = c.addWorksheet("Excluded - Needs Review", {
          views: [{ state: "frozen", ySplit: 1, showGridLines: !1 }],
        }),
        L = [
          "Date",
          "Bank",
          "Bank Description",
          "Amount",
          "MSO Register Payee",
          "MSO Register Memo",
          "MSO Register Account",
          "Reason Excluded",
        ];
      (M.addRow(L),
        (M.columns = [
          { width: 12 },
          { width: 26 },
          { width: 42 },
          { width: 14 },
          { width: 22 },
          { width: 34 },
          { width: 26 },
          { width: 60 },
        ]),
        m.forEach((e) => {
          const t = M.addRow([
            e.date,
            e.bank,
            e.bankDescription,
            e.amount,
            e.registerPayee,
            e.registerMemo,
            e.registerAccount,
            e.reason,
          ]);
          ((t.getCell(4).numFmt = "#,##0.00"),
            (t.getCell(8).alignment = { wrapText: !0, vertical: "top" }));
        }),
        a(M, 1, L.length),
        g >= 1 && n(M, 2, g + 1, L.length));
      const O = c.addWorksheet("Read Me", { views: [{ showGridLines: !1 }] });
      O.columns = [{ width: 100 }];
      const R = i.reconciliation || {};
      return (
        [
          "HN Bank Expense Categorization & QBO Import Sheet",
          "",
          "Bank / Credit Card account: " + (i.bankAccountLabel || "(not set)"),
          "Period covered: " + (i.dateLabel || "(n/a)"),
          "Built: " + new Date().toLocaleString("en-US"),
          "",
          "How this workbook was built (one line per tab):",
          "  QBO Import — bank transactions matched to the MSO (Sagebrush) register on Date + Amount, then",
          "    categorized via the Master COA / Class / Vendor lists. Excel Table with filter dropdowns; Payee,",
          "    Account and Class cells carry a data-entry dropdown for quick manual correction.",
          "  Excluded - Needs Review — bank transactions with no register match, or a category/class/vendor not",
          "    yet in the master lists. Nothing is force-mapped or dropped — add missing mappings to the",
          "    standing HN vs MSO workbook and re-run.",
          "  Vendor Mappings — reusable Payee/Memo vendor mappings confirmed in the application; no transaction-specific values are hardcoded.",
          "  Lists (hidden) — the HN Payee / Account / Class dropdown source lists.",
          "",
          "Reconciliation (must tie out):",
          "  Bank file total:            " + s(R.bankTotal),
          "  QBO Import total:           " + s(R.impTotal),
          "  Excluded total:             " + s(R.excTotal),
          "  Import + Excluded == Bank:  " + (R.ok ? "OK" : "MISMATCH"),
          "",
          "Notes:",
          "  - Credit card bill payments / bank-to-CC transfers will not have a vendor or GL mapping by design —",
          "    they are Excluded as expected, not an error; they post in QBO as a transfer / CC payment.",
          "  - Intercompany Due (to)/from Related Party lines (Battleborn, Sagebrush, etc.) are always classed",
          '    "Corporate" regardless of the MSO register\'s own Class.',
          "  - One bank account per file — QBO imports per bank account. Add a Bank column back in if you ever",
          "    need to combine multiple banks in one working file before splitting for import.",
        ]
          .concat(
            reviewNote.length
              ? ["", "Check these rows on QBO Import:"].concat(
                  reviewNote.map((e) => "  - " + e),
                )
              : [],
          )
          .forEach((e, t) => {
          ((O.getCell(t + 1, 1).value = e),
            (O.getCell(t + 1, 1).font = { name: "Arial", size: 10 }));
        }),
        (O.getCell(1, 1).font = {
          name: "Arial",
          size: 13,
          bold: !0,
          color: { argb: t },
        }),
        c
      );
    },
  };
  ("undefined" != typeof module && module.exports && (module.exports = i),
    (e.ExpXlsx = i));
})("undefined" != typeof self ? self : this);
