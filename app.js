const state = {
  cards: [],
  payload: null,
  activeTab: "knowledge",
  knowledgeView: "cards",
  flippedCards: new Set(),
  practiceStats: {},
  priorityOverrides: {},
};

const PRACTICE_STORAGE_KEY = "phrasebook-practice-stats";
const PRIORITY_OVERRIDE_STORAGE_KEY = "phrasebook-priority-overrides";
const FAMILIAR_DAYS = 30;

const pageTitles = {
  knowledge: ["KNOWLEDGE BASE", "知识库"],
  extract: ["TEXT EXTRACTION", "文字提取"],
  rules: ["RULES", "提取规则"],
};

const elements = {
  tabs: [...document.querySelectorAll("[data-tab]")],
  panels: [...document.querySelectorAll("[data-panel]")],
  workspaceEyebrow: document.querySelector("#workspaceEyebrow"),
  workspaceTitle: document.querySelector("#workspaceTitle"),
  generatedAt: document.querySelector("#generatedAt"),
  navCardCount: document.querySelector("#navCardCount"),
  cardCount: document.querySelector("#cardCount"),
  totalOccurrences: document.querySelector("#totalOccurrences"),
  sourceCount: document.querySelector("#sourceCount"),
  masteredCount: document.querySelector("#masteredCount"),
  cardList: document.querySelector("#cardList"),
  searchInput: document.querySelector("#searchInput"),
  kindFilter: document.querySelector("#kindFilter"),
  priorityFilter: document.querySelector("#priorityFilter"),
  proficiencyFilter: document.querySelector("#proficiencyFilter"),
  sortSelect: document.querySelector("#sortSelect"),
  viewToggle: document.querySelector("#viewToggle"),
  exportList: document.querySelector("#exportList"),
  tableList: document.querySelector("#tableList"),
  extractForm: document.querySelector("#extractForm"),
  sourceTitle: document.querySelector("#sourceTitle"),
  sourceText: document.querySelector("#sourceText"),
  fillDemo: document.querySelector("#fillDemo"),
  candidateList: document.querySelector("#candidateList"),
  confirmCandidates: document.querySelector("#confirmCandidates"),
  ruleEditor: document.querySelector("#ruleEditor"),
};

const demoText = `A: Let's take it one step at a time.
B: Sounds good. I'll keep you posted.
A: What is our priority?
B: The launch is our priority. I'll keep you posted.`;

const simulatedRules = [
  {
    match: /one step at a time/gi,
    phrase: "One step at a time",
    meaning: "一步一步来",
    kind: "phrase",
  },
  {
    match: /keep you posted/gi,
    phrase: "Keep you posted",
    meaning: "随时向你同步进展",
    kind: "phrase",
  },
  {
    match: /priority/gi,
    phrase: "Priority",
    meaning: "优先事项",
    kind: "word",
  },
  {
    match: /sounds good/gi,
    phrase: "Sounds good",
    meaning: "听起来不错",
    kind: "phrase",
  },
];

function formatDate(value) {
  if (!value) {
    return "暂无数据";
  }
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadPracticeStats() {
  try {
    state.practiceStats = JSON.parse(window.localStorage.getItem(PRACTICE_STORAGE_KEY) || "{}");
  } catch (error) {
    state.practiceStats = {};
  }
}

function savePracticeStats() {
  window.localStorage.setItem(PRACTICE_STORAGE_KEY, JSON.stringify(state.practiceStats));
}

function loadPriorityOverrides() {
  try {
    state.priorityOverrides = JSON.parse(window.localStorage.getItem(PRIORITY_OVERRIDE_STORAGE_KEY) || "{}");
  } catch (error) {
    state.priorityOverrides = {};
  }
  cleanupExpiredPriorityOverrides();
}

function savePriorityOverrides() {
  window.localStorage.setItem(PRIORITY_OVERRIDE_STORAGE_KEY, JSON.stringify(state.priorityOverrides));
}

function cardKey(card) {
  return card.normalized_phrase || card.id || card.phrase;
}

function practiceFor(card) {
  return state.practiceStats[cardKey(card)] || card.practice || { correct: 0, wrong: 0 };
}

function cleanupExpiredPriorityOverrides() {
  const now = Date.now();
  let changed = false;
  Object.entries(state.priorityOverrides).forEach(([key, override]) => {
    if (!override?.expiresAt || new Date(override.expiresAt).getTime() <= now) {
      delete state.priorityOverrides[key];
      changed = true;
    }
  });
  if (changed) {
    savePriorityOverrides();
  }
}

function priorityOverrideFor(card) {
  const override = state.priorityOverrides[cardKey(card)] || card.priority_override;
  if (!override?.priority || !override?.expiresAt) {
    if (!override?.priority || !override?.expires_at) {
      return null;
    }
  }
  const expiresAt = override.expiresAt || override.expires_at;
  if (new Date(expiresAt).getTime() <= Date.now()) {
    delete state.priorityOverrides[cardKey(card)];
    savePriorityOverrides();
    return null;
  }
  return { priority: override.priority, expiresAt };
}

function effectivePriority(card) {
  return priorityOverrideFor(card)?.priority || card.priority || "";
}

function findCardByKey(cardKeyValue) {
  return state.cards.find((card) => cardKey(card) === cardKeyValue);
}

function toggleFamiliar(cardKeyValue) {
  const card = findCardByKey(cardKeyValue);
  if (state.priorityOverrides[cardKeyValue]) {
    delete state.priorityOverrides[cardKeyValue];
    if (card) {
      delete card.priority_override;
    }
    savePriorityOverrides();
    return;
  }

  const expiresAt = new Date(Date.now() + FAMILIAR_DAYS * 24 * 60 * 60 * 1000).toISOString();
  state.priorityOverrides[cardKeyValue] = {
    priority: "P4",
    expiresAt,
  };
  if (card) {
    card.priority_override = {
      priority: "P4",
      expires_at: expiresAt,
      reason: "familiar",
    };
  }
  savePriorityOverrides();
}

function mergeCard(updatedCard) {
  if (!updatedCard) {
    return;
  }
  const key = cardKey(updatedCard);
  const index = state.cards.findIndex((card) => cardKey(card) === key);
  if (index >= 0) {
    state.cards[index] = updatedCard;
  }
}

async function postProgress(path, payload) {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Progress API failed: ${response.status}`);
  }
  return response.json();
}

function hydrateProgressFromCards() {
  state.cards.forEach((card) => {
    const key = cardKey(card);
    if (card.practice) {
      state.practiceStats[key] = {
        correct: Number(card.practice.correct || 0),
        wrong: Number(card.practice.wrong || 0),
      };
    }
    const override = priorityOverrideFor(card);
    if (override) {
      state.priorityOverrides[key] = override;
    }
  });
  savePracticeStats();
  savePriorityOverrides();
}

function updateFamiliarRow(button, cardKeyValue) {
  const card = findCardByKey(cardKeyValue);
  const row = button.closest("tr");
  if (!card || !row) {
    return;
  }

  const priorityCell = row.children[2];
  if (priorityCell) {
    priorityCell.textContent = effectivePriority(card) || "未分级";
  }
  button.textContent = priorityOverrideFor(card) ? "不熟悉" : "熟悉";
}

function accuracyFor(stats) {
  const total = stats.correct + stats.wrong;
  if (!total) {
    return "未测试";
  }
  return `${Math.round((stats.correct / total) * 100)}%`;
}

function accuracyValue(card) {
  const stats = practiceFor(card);
  const total = stats.correct + stats.wrong;
  return total ? stats.correct / total : -1;
}

function frequencyValue(card) {
  if (card.frequency_label === "待核对") {
    return null;
  }
  return Number.isFinite(Number(card.total_count)) ? Number(card.total_count) : null;
}

function priorityValue(card) {
  const priority = effectivePriority(card) || "P9";
  const match = priority.match(/\d+/);
  return match ? Number(match[0]) : 9;
}

function proficiencyValue(card) {
  const proficiency = card.proficiency || "";
  const match = proficiency.match(/^\d/);
  return match ? match[0] : "unknown";
}

function sortCards(cards) {
  const sort = elements.sortSelect?.value || "priority-asc";
  const sorted = [...cards];
  const compareFrequency = (a, b, direction = "desc") => {
    const left = frequencyValue(a);
    const right = frequencyValue(b);

    if (left === null && right === null) {
      return a.phrase.localeCompare(b.phrase);
    }
    if (left === null) {
      return 1;
    }
    if (right === null) {
      return -1;
    }
    return direction === "desc" ? right - left : left - right;
  };

  sorted.sort((a, b) => {
    if (sort === "frequency-desc") {
      return compareFrequency(a, b, "desc") || a.phrase.localeCompare(b.phrase);
    }
    if (sort === "frequency-asc") {
      return compareFrequency(a, b, "asc") || a.phrase.localeCompare(b.phrase);
    }
    if (sort === "accuracy-desc") {
      return accuracyValue(b) - accuracyValue(a) || compareFrequency(a, b, "desc");
    }
    if (sort === "accuracy-asc") {
      return accuracyValue(a) - accuracyValue(b) || compareFrequency(a, b, "desc");
    }
    if (sort === "priority-desc") {
      return priorityValue(b) - priorityValue(a) || compareFrequency(a, b, "desc");
    }
    return priorityValue(a) - priorityValue(b) || compareFrequency(a, b, "desc");
  });

  return sorted;
}

function setTab(tab) {
  state.activeTab = tab;
  elements.tabs.forEach((item) => item.classList.toggle("active", item.dataset.tab === tab));
  elements.panels.forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === tab));
  const [eyebrow, title] = pageTitles[tab] || pageTitles.knowledge;
  if (elements.workspaceEyebrow) {
    elements.workspaceEyebrow.textContent = eyebrow;
  }
  if (elements.workspaceTitle) {
    elements.workspaceTitle.textContent = title;
  }
}

function updateSummary(payload) {
  const summary = payload.summary || {};
  if (elements.generatedAt) {
    elements.generatedAt.textContent = `更新于 ${formatDate(payload.generated_at)}`;
  }
  if (elements.navCardCount) {
    elements.navCardCount.textContent = summary.card_count ?? 0;
  }
  if (elements.cardCount) {
    elements.cardCount.textContent = summary.card_count ?? 0;
  }
  if (elements.totalOccurrences) {
    elements.totalOccurrences.textContent = summary.total_occurrences ?? 0;
  }
  if (elements.sourceCount) {
    elements.sourceCount.textContent = summary.source_count ?? 0;
  }
  if (elements.masteredCount) {
    elements.masteredCount.textContent = summary.mastered_count ?? 0;
  }
}

function latestOccurrence(card) {
  const occurrences = card.occurrences || [];
  return occurrences[occurrences.length - 1] || {};
}

function renderCards(cards) {
  if (!cards.length) {
    elements.cardList.innerHTML = `
      <div class="empty">
        还没有匹配的卡片。请把原文放入 <code>content/inbox</code>，本地运行处理脚本后同步到 GitHub。
      </div>
    `;
    return;
  }

  elements.cardList.innerHTML = cards
    .map((card) => {
      const occurrence = latestOccurrence(card);
      const frequency = card.frequency_label || `${card.total_count ?? 0} 次`;
      const key = cardKey(card);
      const stats = practiceFor(card);
      const isFlipped = state.flippedCards.has(key);
      const priority = effectivePriority(card);
      return `
        <article class="expression-card ${isFlipped ? "flipped" : ""}" data-card-key="${escapeHtml(key)}">
          <div class="card-face card-front">
            <div class="card-meta">
              <span>${escapeHtml(priority || (card.kind === "word" ? "WORD" : "PHRASE"))}</span>
              <span>${escapeHtml(frequency)}</span>
            </div>
            <div class="front-word">
              <h3>${escapeHtml(card.phrase)}</h3>
              <p>${card.kind === "word" ? "WORD" : "PHRASE"}</p>
            </div>
            <div class="card-footer">
              <span>点击查看详情</span>
              <span>${escapeHtml(card.proficiency || "new")}</span>
            </div>
          </div>

          <div class="card-face card-back">
            <div class="card-meta">
              <span>${escapeHtml(priority || "未分级")}</span>
              <span>${escapeHtml(frequency)}</span>
            </div>
            <div class="back-meaning">
              <p class="meaning">${escapeHtml(card.meaning || "待补充含义")}</p>
            </div>
            <div class="practice-stats">
              <span>正确率 <strong>${accuracyFor(stats)}</strong></span>
              <span>正确 <strong>${stats.correct}</strong></span>
              <span>错误 <strong>${stats.wrong}</strong></span>
            </div>
            <div class="practice-actions">
              <button type="button" data-practice="correct" data-card-key="${escapeHtml(key)}">正确</button>
              <button type="button" data-practice="wrong" data-card-key="${escapeHtml(key)}">错误</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function applyFilters() {
  renderKnowledge();
}

function currentFilteredCards() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const kind = elements.kindFilter.value;
  const priority = elements.priorityFilter?.value || "all";
  const proficiency = elements.proficiencyFilter?.value || "all";

  const filtered = state.cards.filter((card) => {
    const occurrence = latestOccurrence(card);
    const cardPriority = effectivePriority(card);
    const text = [card.phrase, card.meaning, cardPriority, card.frequency_label, occurrence.source_title, occurrence.example]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesQuery = !query || text.includes(query);
    const matchesKind = kind === "all" || card.kind === kind;
    const matchesPriority = priority === "all" || cardPriority === priority;
    const matchesProficiency = proficiency === "all" || proficiencyValue(card) === proficiency;
    return matchesQuery && matchesKind && matchesPriority && matchesProficiency;
  });

  return sortCards(filtered);
}

function rerenderCurrentCards() {
  renderKnowledge();
}

function renderTable(cards) {
  if (!cards.length) {
    elements.tableList.innerHTML = `
      <div class="empty">
        还没有匹配的列表结果。请调整搜索、筛选或排序条件。
      </div>
    `;
    return;
  }

  elements.tableList.innerHTML = `
    <table class="knowledge-table">
      <thead>
        <tr>
          <th>英文</th>
          <th>中文</th>
          <th>优先级</th>
          <th>频率</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        ${cards
          .map((card) => {
            const frequency = card.frequency_label || `${card.total_count ?? 0} 次`;
            const priority = effectivePriority(card);
            const key = cardKey(card);
            const isFamiliar = Boolean(priorityOverrideFor(card));
            const actionText = isFamiliar ? "不熟悉" : "熟悉";
            return `
              <tr>
                <td>${escapeHtml(card.phrase)}</td>
                <td>${escapeHtml(card.meaning || "待补充含义")}</td>
                <td>${escapeHtml(priority || "未分级")}</td>
                <td>${escapeHtml(frequency)}</td>
                <td><button class="text-action" type="button" data-familiar="${escapeHtml(key)}">${actionText}</button></td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

function renderKnowledge() {
  const cards = currentFilteredCards();
  const isListView = state.knowledgeView === "list";

  elements.cardList.hidden = isListView;
  elements.tableList.hidden = !isListView;
  elements.viewToggle.textContent = isListView ? "列表视图" : "卡片视图";
  elements.viewToggle.setAttribute("aria-pressed", String(isListView));

  if (isListView) {
    renderTable(cards);
    return;
  }
  renderCards(cards);
}

function csvValue(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function exportCurrentList() {
  const cards = currentFilteredCards();
  const rows = [["英文", "中文", "优先级", "频率"]];
  cards.forEach((card) => {
    rows.push([card.phrase, card.meaning || "", effectivePriority(card) || "", card.frequency_label || `${card.total_count ?? 0}`]);
  });

  const csv = rows.map((row) => row.map(csvValue).join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `phrasebook-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function sentenceFor(text, phrase) {
  const sentences = text.split(/(?<=[.!?。！？])\s+/);
  const found = sentences.find((sentence) => sentence.toLowerCase().includes(phrase.toLowerCase()));
  return found || text.split("\n").find(Boolean) || "";
}

function simulateExtract(text) {
  return simulatedRules
    .map((rule) => {
      const matches = text.match(rule.match) || [];
      if (!matches.length) {
        return null;
      }
      return {
        ...rule,
        count: matches.length,
        example: sentenceFor(text, rule.phrase),
      };
    })
    .filter(Boolean);
}

function renderCandidates(candidates) {
  if (!candidates.length) {
    elements.candidateList.innerHTML = `<div class="empty">没有生成候选。真实提取会在后续接入本地模型和 Skill。</div>`;
    elements.confirmCandidates.disabled = true;
    return;
  }

  elements.candidateList.innerHTML = candidates
    .map(
      (candidate) => `
        <article class="candidate-card">
          <span>${candidate.kind === "word" ? "单词" : "短句"} · ${candidate.count} 次</span>
          <strong>${escapeHtml(candidate.phrase)}</strong>
          <p>${escapeHtml(candidate.meaning)}</p>
          <p class="example">${escapeHtml(candidate.example)}</p>
        </article>
      `,
    )
    .join("");
  elements.confirmCandidates.disabled = false;
}

async function loadKnowledge() {
  try {
    const response = await fetch("./public/knowledge.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load knowledge: ${response.status}`);
    }
    const payload = await response.json();
    state.payload = payload;
    state.cards = payload.cards || [];
    hydrateProgressFromCards();
    updateSummary(payload);
    elements.ruleEditor.value = payload.skill?.content || "暂无 Skill 内容";
    renderKnowledge();
  } catch (error) {
    if (elements.generatedAt) {
      elements.generatedAt.textContent = "未找到导出数据";
    }
    elements.ruleEditor.value = "请先本地运行 python3 scripts/process.py 生成 public/knowledge.json。";
    elements.cardList.innerHTML = `
      <div class="empty">
        未能读取 <code>public/knowledge.json</code>。请先运行本地处理脚本，然后 push 到 GitHub。
      </div>
    `;
  }
}

elements.tabs.forEach((tab) => {
  tab.addEventListener("click", () => setTab(tab.dataset.tab));
});

elements.searchInput.addEventListener("input", applyFilters);
elements.kindFilter.addEventListener("change", applyFilters);
elements.priorityFilter.addEventListener("change", applyFilters);
elements.proficiencyFilter.addEventListener("change", applyFilters);
elements.sortSelect.addEventListener("change", applyFilters);
elements.viewToggle.addEventListener("click", () => {
  state.knowledgeView = state.knowledgeView === "cards" ? "list" : "cards";
  renderKnowledge();
});
elements.exportList.addEventListener("click", exportCurrentList);

elements.tableList.addEventListener("click", async (event) => {
  const familiarButton = event.target.closest("[data-familiar]");
  if (!familiarButton) {
    return;
  }
  const key = familiarButton.dataset.familiar;
  toggleFamiliar(key);
  updateFamiliarRow(familiarButton, key);
  try {
    const result = await postProgress("/api/familiar", {
      card_key: key,
      familiar: Boolean(state.priorityOverrides[key]),
    });
    mergeCard(result.card);
    updateFamiliarRow(familiarButton, key);
  } catch (error) {
    console.warn("Falling back to browser-only familiar storage.", error);
  }
});

elements.cardList.addEventListener("click", async (event) => {
  const practiceButton = event.target.closest("[data-practice]");
  if (practiceButton) {
    event.stopPropagation();
    const key = practiceButton.dataset.cardKey;
    const action = practiceButton.dataset.practice;
    const stats = state.practiceStats[key] || { correct: 0, wrong: 0 };
    stats[action] += 1;
    state.practiceStats[key] = stats;
    savePracticeStats();
    rerenderCurrentCards();
    try {
      const result = await postProgress("/api/practice", {
        card_key: key,
        action,
      });
      mergeCard(result.card);
      if (result.card?.practice) {
        state.practiceStats[key] = {
          correct: Number(result.card.practice.correct || 0),
          wrong: Number(result.card.practice.wrong || 0),
        };
        savePracticeStats();
        rerenderCurrentCards();
      }
    } catch (error) {
      console.warn("Falling back to browser-only practice storage.", error);
    }
    return;
  }

  const card = event.target.closest(".expression-card");
  if (!card) {
    return;
  }

  const key = card.dataset.cardKey;
  if (state.flippedCards.has(key)) {
    state.flippedCards.delete(key);
  } else {
    state.flippedCards.add(key);
  }
  rerenderCurrentCards();
});

elements.fillDemo.addEventListener("click", () => {
  elements.sourceTitle.value = "Demo work conversation";
  elements.sourceText.value = demoText;
});

elements.extractForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = elements.sourceText.value.trim();
  if (!text) {
    renderCandidates([]);
    return;
  }
  renderCandidates(simulateExtract(text));
});

elements.confirmCandidates.addEventListener("click", () => {
  elements.confirmCandidates.textContent = "一期需由本地脚本入库";
  window.setTimeout(() => {
    elements.confirmCandidates.textContent = "确认并同步到知识库";
  }, 1800);
});

loadPracticeStats();
loadPriorityOverrides();
setTab("knowledge");
loadKnowledge();
