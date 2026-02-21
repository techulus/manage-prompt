(function () {
  function highlightJSON(str) {
    try {
      var obj = JSON.parse(str);
      return formatValue(obj, 0);
    } catch (e) {
      return escapeHTML(str);
    }
  }

  function formatValue(val, indent) {
    if (val === null) return '<span class="json-null">null</span>';
    if (typeof val === "boolean") return '<span class="json-boolean">' + val + "</span>";
    if (typeof val === "number") return '<span class="json-number">' + val + "</span>";
    if (typeof val === "string") return '<span class="json-string">"' + escapeHTML(val) + '"</span>';
    if (Array.isArray(val)) return formatArray(val, indent);
    if (typeof val === "object") return formatObject(val, indent);
    return escapeHTML(String(val));
  }

  function formatObject(obj, indent) {
    var keys = Object.keys(obj);
    if (keys.length === 0) return "{}";
    var pad = "  ".repeat(indent + 1);
    var endPad = "  ".repeat(indent);
    var lines = keys.map(function (key) {
      return pad + '<span class="json-key">"' + escapeHTML(key) + '"</span>: ' + formatValue(obj[key], indent + 1);
    });
    return "{\n" + lines.join(",\n") + "\n" + endPad + "}";
  }

  function formatArray(arr, indent) {
    if (arr.length === 0) return "[]";
    var pad = "  ".repeat(indent + 1);
    var endPad = "  ".repeat(indent);
    var lines = arr.map(function (item) {
      return pad + formatValue(item, indent + 1);
    });
    return "[\n" + lines.join(",\n") + "\n" + endPad + "]";
  }

  function escapeHTML(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  document.querySelectorAll(".json-view").forEach(function (el) {
    var raw = el.textContent.trim();
    if (raw) {
      el.innerHTML = highlightJSON(raw);
    }
  });

  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = document.getElementById(btn.dataset.target);
      if (!target) return;
      navigator.clipboard.writeText(target.textContent).then(function () {
        btn.textContent = "Copied!";
        setTimeout(function () { btn.textContent = "Copy"; }, 1500);
      });
    });
  });
})();
