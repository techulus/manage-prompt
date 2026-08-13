(function () {
  var sizeInput = document.getElementById("font-size");
  var savedSize = localStorage.getItem("mp-font-size");

  if (savedSize) {
    sizeInput.value = savedSize;
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

  function buildCustomSettingsCss(size) {
    return "html{-webkit-text-size-adjust:100%;text-size-adjust:100%}" +
      "*{font-size:" + size + " !important}";
  }

  function applySettings() {
    var rawSize = sizeInput.value.trim();
    var normalizedSize = normalizeFontSize(rawSize);
    var invalidSize = rawSize && !normalizedSize;

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

    if (size) {
      var css = buildCustomSettingsCss(size);
      var style = document.createElement("style");
      style.setAttribute("id", "mp-custom-settings");
      style.textContent = css;
      document.head.appendChild(style);
    }
  }

  sizeInput.addEventListener("change", applySettings);
  sizeInput.addEventListener("blur", applySettings);
})();
