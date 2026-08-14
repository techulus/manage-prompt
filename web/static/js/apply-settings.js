(function () {
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

  var size = normalizeFontSize(localStorage.getItem("mp-font-size") || "");
  if (!size) return;

  var existing = document.getElementById("mp-custom-settings");
  if (existing) existing.remove();

  var style = document.createElement("style");
  style.setAttribute("id", "mp-custom-settings");
  style.textContent = buildCustomSettingsCss(size);
  document.head.appendChild(style);
})();
