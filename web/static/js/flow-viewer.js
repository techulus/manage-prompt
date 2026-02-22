(function () {
  var requestBodyEl = document.getElementById("request-body");
  var rawResponseEl = document.getElementById("raw-response");
  var responseBodyEl = document.getElementById("response-body");
  var flowContainer = document.getElementById("flow-view");

  if (!flowContainer) return;

  var requestBody = safeParse(requestBodyEl);
  var rawResponse = safeParse(rawResponseEl);
  var responseText = responseBodyEl ? responseBodyEl.textContent.trim() : "";

  var nodes = [];

  nodes = nodes.concat(parseRequestMessages(requestBody));
  nodes = nodes.concat(parseResponse(rawResponse, responseText));

  if (nodes.length === 0) return;

  var grouped = groupToolPairs(nodes);
  flowContainer.innerHTML = renderFlow(grouped);
  bindExpandToggles();

  function safeParse(el) {
    if (!el) return null;
    try {
      return JSON.parse(el.textContent.trim());
    } catch (e) {
      return null;
    }
  }

  function parseRequestMessages(body) {
    if (!body) return [];
    var messages = [];

    if (Array.isArray(body)) {
      for (var i = 0; i < body.length; i++) {
        var msg = body[i];
        if (msg.role && msg.role !== "assistant") {
          messages.push(messageToNode(msg));
        }
      }
    }

    return messages;
  }

  function messageToNode(msg) {
    var content = "";
    if (typeof msg.content === "string") {
      content = msg.content;
    } else if (Array.isArray(msg.content)) {
      var parts = [];
      for (var i = 0; i < msg.content.length; i++) {
        var part = msg.content[i];
        if (part.type === "text") {
          parts.push(part.text);
        } else if (part.type === "image_url" || part.type === "image") {
          parts.push("[image]");
        } else if (part.type === "tool_result" || part.type === "tool-result") {
          return {
            role: "tool-result",
            toolName: part.toolName || part.tool_use_id || "tool",
            content: typeof part.content === "string" ? part.content : JSON.stringify(part.content, null, 2)
          };
        } else {
          parts.push("[" + part.type + "]");
        }
      }
      content = parts.join("\n");
    }

    return { role: msg.role, content: content };
  }

  function parseResponse(raw, textFallback) {
    if (!raw) {
      if (textFallback) {
        return [{ role: "assistant", content: textFallback }];
      }
      return [];
    }

    if (raw.object === "chat.completion") return parseOpenAIResponse(raw);
    if (raw.type === "message") return parseAnthropicResponse(raw);
    if (Array.isArray(raw)) return parseStreamChunks(raw);
    if (raw.content && Array.isArray(raw.content)) return parseAISDKResult(raw);

    if (textFallback) {
      return [{ role: "assistant", content: textFallback }];
    }
    return [];
  }

  function parseOpenAIResponse(raw) {
    var nodes = [];
    var choices = raw.choices || [];

    for (var i = 0; i < choices.length; i++) {
      var msg = choices[i].message;
      if (!msg) continue;

      if (msg.tool_calls && msg.tool_calls.length > 0) {
        for (var j = 0; j < msg.tool_calls.length; j++) {
          var tc = msg.tool_calls[j];
          var args = tc.function && tc.function.arguments;
          try { args = JSON.stringify(JSON.parse(args), null, 2); } catch (e) {}
          nodes.push({
            role: "tool-call",
            toolName: tc.function ? tc.function.name : "unknown",
            toolCallId: tc.id,
            content: args || ""
          });
        }
      }

      if (msg.content) {
        nodes.push({ role: "assistant", content: msg.content });
      }
    }

    attachUsage(nodes, raw.usage, "openai");
    return nodes;
  }

  function parseAnthropicResponse(raw) {
    var nodes = [];
    var content = raw.content || [];

    for (var i = 0; i < content.length; i++) {
      var block = content[i];
      if (block.type === "tool_use") {
        nodes.push({
          role: "tool-call",
          toolName: block.name,
          toolCallId: block.id,
          content: JSON.stringify(block.input, null, 2)
        });
      } else if (block.type === "text" && block.text) {
        nodes.push({ role: "assistant", content: block.text });
      }
    }

    attachUsage(nodes, raw.usage, "anthropic");
    return nodes;
  }

  function parseStreamChunks(chunks) {
    var nodes = [];
    var text = "";
    var usage = null;

    for (var i = 0; i < chunks.length; i++) {
      var chunk = chunks[i];

      if (chunk.type === "tool-call") {
        var args = chunk.args || chunk.input || "";
        nodes.push({
          role: "tool-call",
          toolName: chunk.toolName || "unknown",
          toolCallId: chunk.toolCallId,
          content: typeof args === "string" ? args : JSON.stringify(args, null, 2)
        });
      }

      if (chunk.type === "tool-result") {
        var result = chunk.result || chunk.output || "";
        nodes.push({
          role: "tool-result",
          toolName: chunk.toolName || "tool",
          toolCallId: chunk.toolCallId,
          content: typeof result === "string" ? result : JSON.stringify(result, null, 2)
        });
      }

      if (chunk.type === "text-delta" && chunk.delta) {
        text += chunk.delta;
      }

      if (chunk.type === "step-finish") {
        if (text) {
          nodes.push({ role: "assistant", content: text });
          text = "";
        }
      }

      if (chunk.type === "finish" && chunk.usage) {
        var u = chunk.usage;
        usage = {
          input: u.inputTokens ? (u.inputTokens.total || u.inputTokens.noCache) : undefined,
          output: u.outputTokens ? (u.outputTokens.total || u.outputTokens.text) : undefined
        };
      }
    }

    if (text) {
      nodes.push({ role: "assistant", content: text });
    }

    if (usage && nodes.length > 0) {
      nodes[nodes.length - 1].usage = usage;
    }

    return nodes;
  }

  function parseAISDKResult(raw) {
    var nodes = [];
    var content = raw.content || [];

    for (var i = 0; i < content.length; i++) {
      var part = content[i];
      if (part.type === "tool-call") {
        var tcArgs = part.args || part.input || "";
        nodes.push({
          role: "tool-call",
          toolName: part.toolName || "unknown",
          toolCallId: part.toolCallId,
          content: typeof tcArgs === "string" ? tcArgs : JSON.stringify(tcArgs, null, 2)
        });
      } else if (part.type === "tool-result") {
        var tcResult = part.result || part.output || "";
        nodes.push({
          role: "tool-result",
          toolName: part.toolName || "tool",
          toolCallId: part.toolCallId,
          content: typeof tcResult === "string" ? tcResult : JSON.stringify(tcResult, null, 2)
        });
      } else if (part.type === "text" && part.text) {
        nodes.push({ role: "assistant", content: part.text });
      }
    }

    if (raw.usage && nodes.length > 0) {
      var u = raw.usage;
      nodes[nodes.length - 1].usage = {
        input: u.inputTokens ? (u.inputTokens.total || u.inputTokens.noCache) : u.prompt_tokens,
        output: u.outputTokens ? (u.outputTokens.total || u.outputTokens.text) : u.completion_tokens
      };
    }

    return nodes;
  }

  function attachUsage(nodes, usage, provider) {
    if (!usage || nodes.length === 0) return;
    var last = nodes[nodes.length - 1];
    if (provider === "openai") {
      last.usage = {
        input: usage.prompt_tokens,
        output: usage.completion_tokens,
        cached: usage.prompt_tokens_details ? usage.prompt_tokens_details.cached_tokens : undefined
      };
    } else if (provider === "anthropic") {
      last.usage = {
        input: usage.input_tokens,
        output: usage.output_tokens,
        cached: usage.cache_read_input_tokens
      };
    }
  }

  function groupToolPairs(nodes) {
    var grouped = [];
    var i = 0;
    while (i < nodes.length) {
      if (nodes[i].role === "tool-call") {
        var group = { type: "tool-group", calls: [] };
        while (i < nodes.length && (nodes[i].role === "tool-call" || nodes[i].role === "tool-result")) {
          group.calls.push(nodes[i]);
          i++;
        }
        grouped.push(group);
      } else {
        grouped.push({ type: "node", node: nodes[i] });
        i++;
      }
    }
    return grouped;
  }

  function renderFlow(grouped) {
    var html = "";
    for (var i = 0; i < grouped.length; i++) {
      var item = grouped[i];
      var isLast = i === grouped.length - 1;

      if (item.type === "tool-group") {
        html += renderToolGroup(item.calls);
      } else {
        html += renderNode(item.node);
      }

      if (!isLast) {
        html += '<div class="flow-connector-wrap"><div class="flow-connector"></div></div>';
      }
    }
    return html;
  }

  function renderToolGroup(calls) {
    var html = '<div class="flow-tool-group">';
    html += '<div class="flow-tool-group-label">Tool Use</div>';
    html += '<div class="flow-tool-group-items">';

    for (var i = 0; i < calls.length; i++) {
      var call = calls[i];
      var isCall = call.role === "tool-call";

      html += '<div class="flow-tool-item flow-tool-item-' + (isCall ? "call" : "result") + '">';
      html += '<div class="flow-tool-item-header">';
      html += '<span class="flow-tool-badge flow-tool-badge-' + (isCall ? "call" : "result") + '">';
      html += isCall ? "call" : "result";
      html += '</span>';
      html += '<span class="flow-tool-fn">' + escapeHTML(call.toolName || "") + '</span>';
      html += '</div>';

      var content = call.content || "";
      if (content) {
        var isLong = content.length > 300;
        html += '<div class="flow-tool-item-body' + (isLong ? " flow-collapsed" : "") + '">';
        html += '<pre>' + escapeHTML(content) + '</pre>';
        html += '</div>';
        if (isLong) {
          html += '<button class="flow-expand-btn" data-expanded="false">show more</button>';
        }
      }

      html += '</div>';
    }

    html += '</div></div>';
    return html;
  }

  function renderNode(node) {
    var html = '<div class="flow-node-wrapper">';
    html += '<div class="flow-node flow-node-' + escapeAttr(node.role) + '">';
    html += '<div class="flow-node-header">';
    html += '<span class="flow-role flow-role-' + escapeAttr(node.role) + '">' + roleLabel(node) + '</span>';
    html += '</div>';

    var content = node.content || "";
    if (content) {
      var isLong = content.length > 500;
      html += '<div class="flow-content' + (isLong ? " flow-collapsed" : "") + '">';
      html += '<pre>' + escapeHTML(content) + '</pre>';
      html += '</div>';
      if (isLong) {
        html += '<button class="flow-expand-btn" data-expanded="false">show more</button>';
      }
    }

    if (node.usage) {
      html += '<div class="flow-usage">';
      if (node.usage.input != null) html += '<span class="flow-usage-item"><strong>' + node.usage.input + '</strong> input</span>';
      if (node.usage.output != null) html += '<span class="flow-usage-item"><strong>' + node.usage.output + '</strong> output</span>';
      if (node.usage.cached) html += '<span class="flow-usage-item"><strong>' + node.usage.cached + '</strong> cached</span>';
      html += '</div>';
    }

    html += '</div></div>';
    return html;
  }

  function roleLabel(node) {
    switch (node.role) {
      case "system": return "System";
      case "user": return "User";
      case "assistant": return "Assistant";
      default: return node.role;
    }
  }

  function escapeHTML(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function escapeAttr(str) {
    return str.replace(/[^a-zA-Z0-9-]/g, "-");
  }

  function bindExpandToggles() {
    var buttons = flowContainer.querySelectorAll(".flow-expand-btn");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function () {
        var content = this.previousElementSibling;
        if (this.getAttribute("data-expanded") === "false") {
          content.classList.remove("flow-collapsed");
          this.textContent = "show less";
          this.setAttribute("data-expanded", "true");
        } else {
          content.classList.add("flow-collapsed");
          this.textContent = "show more";
          this.setAttribute("data-expanded", "false");
        }
      });
    }
  }
})();
