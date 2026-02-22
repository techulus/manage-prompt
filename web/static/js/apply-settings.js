(function () {
  function sanitizeFontFamily(value) {
    return value.replace(/[{};<>]/g, "").trim();
  }

  function normalizeFontSize(value) {
    var size = value.trim().toLowerCase();
    if (!size) return "";

    if (/^\d+(\.\d+)?$/.test(size)) {
      return size + "px";
    }

    if (/^\d+(\.\d+)?(px|rem|em|%)$/.test(size)) {
      return size;
    }

    return "";
  }

  function buildCustomSettingsCss(family, size) {
    var css = "";

    if (family) {
      var fv = family + ", ui-monospace, monospace";
      css += ":root{--font-mono:" + fv + "}";
      css += "*{font-family:" + fv + " !important}";
    }

    if (size) {
      css += "html{-webkit-text-size-adjust:100%;text-size-adjust:100%}";
      css += "*{font-size:" + size + " !important}";
    }

    return css;
  }

  var family = sanitizeFontFamily(localStorage.getItem("mp-font-family") || "");
  var size = normalizeFontSize(localStorage.getItem("mp-font-size") || "");
  if (!family && !size) return;

  var existing = document.getElementById("mp-custom-settings");
  if (existing) existing.remove();

  var style = document.createElement("style");
  style.setAttribute("id", "mp-custom-settings");
  style.textContent = buildCustomSettingsCss(family, size);
  document.head.appendChild(style);
})();
