(function () {
  let currentPage = 1;
  const limit = 50;

  function esc(str) {
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  function formatCost(cost) {
    if (!cost) return "\u2014";
    return "$" + cost.toFixed(6);
  }

  function formatTokens(req) {
    if (!req.tokens_input && !req.tokens_output) return "\u2014";
    var s = (req.tokens_input || 0) + " \u2192 " + (req.tokens_output || 0);
    if (req.cache_read_tokens) s += " (\u21B5" + req.cache_read_tokens + ")";
    if (req.cache_write_tokens) s += " (\u2191" + req.cache_write_tokens + ")";
    return s;
  }

  function statusClass(code) {
    if (code >= 200 && code < 300) return "status-2";
    if (code >= 400 && code < 500) return "status-4";
    if (code >= 500) return "status-5";
    return "status-0";
  }

  function renderRow(req, prepend) {
    var tbody = document.getElementById("request-list");
    var tr = document.createElement("tr");
    if (prepend) tr.className = "new-row";
    tr.onclick = function () {
      window.location.href = "/ui/requests/" + encodeURIComponent(req.id);
    };
    var providerModel = "";
    if (req.provider && req.model) {
      providerModel = req.provider + " / " + req.model;
    } else if (req.model) {
      providerModel = req.model;
    } else {
      providerModel = req.target_url || "";
    }

    tr.innerHTML =
      "<td>" + esc(formatTime(req.timestamp)) + "</td>" +
      "<td>" + esc(providerModel || "\u2014") + "</td>" +
      '<td class="' + statusClass(req.status_code) + '">' + esc(String(req.status_code)) + "</td>" +
      "<td>" + esc(req.latency_ms + "ms") + "</td>" +
      "<td>" + esc(formatTokens(req)) + "</td>" +
      "<td>" + esc(formatCost(req.cost_usd)) + "</td>";

    if (prepend) {
      tbody.insertBefore(tr, tbody.firstChild);
    } else {
      tbody.appendChild(tr);
    }
  }

  function loadRequests(page) {
    fetch("/api/requests?page=" + parseInt(page, 10) + "&limit=" + limit)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var tbody = document.getElementById("request-list");
        tbody.innerHTML = "";

        var emptyState = document.getElementById("empty-state");
        if (data.requests && data.requests.length > 0) {
          emptyState.style.display = "none";
          data.requests.forEach(function (req) { renderRow(req, false); });
        } else {
          emptyState.style.display = "block";
        }

        renderPagination(data.total, data.page, data.limit);
      });
  }

  function renderPagination(total, page, perPage) {
    var pages = Math.ceil(total / perPage);
    var el = document.getElementById("pagination");
    el.innerHTML = "";
    if (pages <= 1) return;

    for (var i = 1; i <= pages; i++) {
      var btn = document.createElement("button");
      btn.className = "btn" + (i === page ? " active" : "");
      btn.textContent = i;
      btn.setAttribute("data-page", i);
      btn.addEventListener("click", function () {
        goToPage(parseInt(this.getAttribute("data-page"), 10));
      });
      el.appendChild(btn);
    }
  }

  function goToPage(page) {
    currentPage = page;
    loadRequests(page);
  }

  function loadStats() {
    fetch("/api/stats")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var el = document.getElementById("stats");
        el.textContent = "";
        var s1 = document.createElement("span");
        s1.textContent = data.total_requests + " requests";
        var s2 = document.createElement("span");
        s2.textContent = "$" + data.total_cost.toFixed(4);
        var s3 = document.createElement("span");
        s3.textContent = "avg " + Math.round(data.avg_latency_ms) + "ms";
        el.appendChild(s1);
        el.appendChild(s2);
        el.appendChild(s3);
      });
  }

  function connectWS() {
    var protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    var ws = new WebSocket(protocol + "//" + window.location.host + "/api/ws");

    var statusEl = document.getElementById("connection-status");

    ws.onopen = function () {
      statusEl.textContent = "live";
      statusEl.className = "badge connected";
    };

    ws.onclose = function () {
      statusEl.textContent = "disconnected";
      statusEl.className = "badge";
      setTimeout(connectWS, 2000);
    };

    ws.onmessage = function (e) {
      var msg = JSON.parse(e.data);
      if (msg.type === "new_request") {
        fetch("/api/requests/" + encodeURIComponent(msg.id))
          .then(function (r) { return r.json(); })
          .then(function (req) {
            renderRow(req, true);
            document.getElementById("empty-state").style.display = "none";
            loadStats();
          });
      }
    };
  }

  document.getElementById("clear-btn").addEventListener("click", function () {
    if (!confirm("Clear all captured requests?")) return;
    fetch("/api/requests", { method: "DELETE" })
      .then(function () {
        loadRequests(1);
        loadStats();
      });
  });

  loadRequests(1);
  loadStats();
  connectWS();
})();
