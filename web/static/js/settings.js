(function () {
  var familyInput = document.getElementById("font-family");
  var sizeInput = document.getElementById("font-size");
  var savedFamily = localStorage.getItem("mp-font-family");
  var savedSize = localStorage.getItem("mp-font-size");

  if (savedFamily) {
    familyInput.value = savedFamily;
  }

  if (savedSize) {
    sizeInput.value = savedSize;
  }

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

  function applySettings() {
    var family = sanitizeFontFamily(familyInput.value);
    var rawSize = sizeInput.value.trim();
    var normalizedSize = normalizeFontSize(rawSize);
    var invalidSize = rawSize && !normalizedSize;

    if (family) {
      localStorage.setItem("mp-font-family", family);
    } else {
      localStorage.removeItem("mp-font-family");
    }

    if (invalidSize) {
      sizeInput.setCustomValidity("Use a value like 14px, 0.9rem, or 95%.");
    } else {
      sizeInput.setCustomValidity("");
    }

    if (normalizedSize) {
      localStorage.setItem("mp-font-size", normalizedSize);
      if (rawSize !== normalizedSize) {
        sizeInput.value = normalizedSize;
      }
    } else if (!rawSize) {
      localStorage.removeItem("mp-font-size");
    }

    var size = invalidSize
      ? normalizeFontSize(localStorage.getItem("mp-font-size") || "")
      : normalizedSize;

    var existing = document.getElementById("mp-custom-settings");
    if (existing) existing.remove();

    if (family || size) {
      var css = buildCustomSettingsCss(family, size);
      var style = document.createElement("style");
      style.setAttribute("id", "mp-custom-settings");
      style.textContent = css;
      document.head.appendChild(style);
    }
  }

  familyInput.addEventListener("input", applySettings);
  sizeInput.addEventListener("change", applySettings);
  sizeInput.addEventListener("blur", applySettings);
})();
