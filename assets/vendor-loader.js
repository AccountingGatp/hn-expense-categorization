!(function (n) {
  "use strict";
  var o = {
    "vendor/xlsx.full.min.js":
      "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js",
    "vendor/exceljs.min.js":
      "https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js",
  };
  n.GATPLoadScripts = function (n, e) {
    var t = 0;
    !(function r() {
      var d, i, s;
      t >= n.length
        ? e()
        : ((d = n[t++]),
          (i = r),
          ((s = document.createElement("script")).src = d),
          (s.onload = function () {
            i(!0);
          }),
          (s.onerror = function () {
            var n = o[d];
            if (!n)
              return (console.error("Could not load script:", d), void i(!1));
            console.warn(
              'Local "' +
                d +
                '" not found — loading the same version from CDN instead.',
            );
            var e = document.createElement("script");
            ((e.src = n),
              (e.onload = function () {
                i(!0);
              }),
              (e.onerror = function () {
                (console.error(
                  "Could not load script from local path or CDN:",
                  d,
                  n,
                ),
                  i(!1));
              }),
              document.head.appendChild(e));
          }),
          document.head.appendChild(s));
    })();
  };
})("undefined" != typeof window ? window : this);
