// Global Data Store
let appData = null;
let regimeMatrixChart = null;
let directionalBiasChart = null;
let profitFactorChart = null;
let timelineChart = null;

document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    initFilterButtons();
    initSearch();
    loadDashboardData();
});

async function loadDashboardData() {
    try {
        const response = await fetch("dashboard_data.json");
        appData = await response.json();
        renderDashboard(appData);
    } catch (error) {
        console.error("Error loading dashboard data:", error);
    }
}

function renderDashboard(data, activeRegime = "ALL") {
    renderCharts(data, activeRegime);
    renderLeaderboard(data.traders);
    renderTopCoins(data.top_coins);
}

function initTabs() {
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabPanes = document.querySelectorAll(".tab-pane");

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("active"));
            tabPanes.forEach(p => p.classList.remove("active"));

            btn.classList.add("active");
            const tabId = `tab-${btn.dataset.tab}`;
            document.getElementById(tabId).classList.add("active");
        });
    });
}

function initFilterButtons() {
    const filterBtns = document.querySelectorAll("#regime-filters .filter-btn");

    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const regime = btn.dataset.regime;
            renderDashboard(appData, regime);
        });
    });
}

function initSearch() {
    const searchInput = document.getElementById("trader-search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase();
            const rows = document.querySelectorAll("#trader-table-body tr");
            rows.forEach(row => {
                const text = row.innerText.toLowerCase();
                row.style.display = text.includes(query) ? "" : "none";
            });
        });
    }
}

function renderCharts(data, activeRegime) {
    let regimes = data.regimes;
    if (activeRegime !== "ALL") {
        regimes = regimes.filter(r => r.regime === activeRegime);
    }

    const labels = regimes.map(r => r.regime);
    const volumes = regimes.map(r => r.volume_usd / 1e6); // $M
    const pnls = regimes.map(r => r.pnl_usd / 1e6); // $M
    const winRates = regimes.map(r => r.win_rate_pct);
    const buyPcts = regimes.map(r => r.buy_side_pct);
    const sellPcts = regimes.map(r => 100 - r.buy_side_pct);
    const profitFactors = regimes.map(r => r.profit_factor);

    // 1. Regime Matrix Chart
    if (regimeMatrixChart) regimeMatrixChart.destroy();
    const ctx1 = document.getElementById("regimeMatrixChart").getContext("2d");
    regimeMatrixChart = new Chart(ctx1, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Volume ($M)",
                    data: volumes,
                    backgroundColor: "rgba(59, 130, 246, 0.7)",
                    borderColor: "#3b82f6",
                    borderWidth: 1,
                    yAxisID: "y"
                },
                {
                    label: "Net PnL ($M)",
                    data: pnls,
                    backgroundColor: "rgba(16, 185, 129, 0.8)",
                    borderColor: "#10b981",
                    borderWidth: 1,
                    yAxisID: "y"
                },
                {
                    label: "Win Rate (%)",
                    data: winRates,
                    type: "line",
                    borderColor: "#f59e0b",
                    backgroundColor: "#f59e0b",
                    borderWidth: 3,
                    pointRadius: 5,
                    yAxisID: "y1"
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: "#94a3b8" } }
            },
            scales: {
                x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } },
                y: {
                    type: "linear",
                    position: "left",
                    ticks: { color: "#94a3b8" },
                    grid: { color: "rgba(255,255,255,0.05)" },
                    title: { display: true, text: "$ Millions", color: "#94a3b8" }
                },
                y1: {
                    type: "linear",
                    position: "right",
                    min: 50,
                    max: 100,
                    ticks: { color: "#f59e0b" },
                    grid: { drawOnChartArea: false },
                    title: { display: true, text: "Win Rate (%)", color: "#f59e0b" }
                }
            }
        }
    });

    // 2. Directional Bias Chart
    if (directionalBiasChart) directionalBiasChart.destroy();
    const ctx2 = document.getElementById("directionalBiasChart").getContext("2d");
    directionalBiasChart = new Chart(ctx2, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "BUY / Long (%)",
                    data: buyPcts,
                    backgroundColor: "rgba(16, 185, 129, 0.7)"
                },
                {
                    label: "SELL / Short (%)",
                    data: sellPcts,
                    backgroundColor: "rgba(239, 68, 68, 0.7)"
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { stacked: true, ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } },
                y: { stacked: true, max: 100, ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } }
            },
            plugins: { legend: { labels: { color: "#94a3b8" } } }
        }
    });

    // 3. Profit Factor Chart
    if (profitFactorChart) profitFactorChart.destroy();
    const ctx3 = document.getElementById("profitFactorChart").getContext("2d");
    profitFactorChart = new Chart(ctx3, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Profit Factor",
                    data: profitFactors,
                    backgroundColor: "rgba(139, 92, 246, 0.7)",
                    borderColor: "#8b5cf6",
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: "#94a3b8" } } },
            scales: {
                x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } },
                y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } }
            }
        }
    });

    // 4. Timeline Chart
    if (timelineChart) timelineChart.destroy();
    const timelineData = data.daily_series;
    const ctx4 = document.getElementById("timelineChart").getContext("2d");
    timelineChart = new Chart(ctx4, {
        type: "line",
        data: {
            labels: timelineData.map(d => d.date),
            datasets: [
                {
                    label: "Fear & Greed Index (0-100)",
                    data: timelineData.map(d => d.fg_value),
                    borderColor: "#06b6d4",
                    backgroundColor: "rgba(6, 182, 212, 0.1)",
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    yAxisID: "y"
                },
                {
                    label: "Daily Trader PnL ($)",
                    data: timelineData.map(d => d.daily_pnl),
                    borderColor: "#10b981",
                    borderWidth: 1.5,
                    pointRadius: 0,
                    yAxisID: "y1"
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: "#94a3b8" } } },
            scales: {
                x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } },
                y: {
                    type: "linear",
                    position: "left",
                    min: 0,
                    max: 100,
                    title: { display: true, text: "Sentiment Index", color: "#06b6d4" },
                    ticks: { color: "#06b6d4" }
                },
                y1: {
                    type: "linear",
                    position: "right",
                    title: { display: true, text: "Daily Net PnL ($)", color: "#10b981" },
                    ticks: { color: "#10b981" },
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
}

function renderLeaderboard(traders) {
    const tbody = document.getElementById("trader-table-body");
    if (!tbody) return;

    tbody.innerHTML = traders.map((t, idx) => {
        const pnlFormatted = (t.total_pnl >= 0 ? "+" : "") + "$" + t.total_pnl.toLocaleString();
        const pnlClass = t.total_pnl >= 0 ? "positive" : "card-value accent";
        const cohort = t.total_pnl > 500000 ? "Whale Alpha" : t.total_pnl > 100000 ? "Pro Trader" : "Retail Trader";
        const cohortBadge = t.total_pnl > 500000 ? "badge-success" : t.total_pnl > 100000 ? "badge-primary" : "badge-neutral";
        const shortAddr = t.account.substring(0, 8) + "..." + t.account.substring(t.account.length - 6);

        return `
            <tr>
                <td>#${idx + 1}</td>
                <td title="${t.account}"><code>${shortAddr}</code></td>
                <td>${t.total_trades.toLocaleString()}</td>
                <td>$${t.total_vol.toLocaleString()}</td>
                <td class="${pnlClass}"><strong>${pnlFormatted}</strong></td>
                <td>${t.win_rate}%</td>
                <td>${t.buy_pct}%</td>
                <td><span class="badge ${cohortBadge}">${cohort}</span></td>
            </tr>
        `;
    }).join("");
}

function renderTopCoins(coins) {
    const tbody = document.getElementById("coin-table-body");
    if (!tbody) return;

    tbody.innerHTML = coins.map(c => {
        const pnlFormatted = (c.total_pnl >= 0 ? "+" : "") + "$" + c.total_pnl.toLocaleString();
        const pnlClass = c.total_pnl >= 0 ? "positive" : "card-value accent";
        const rating = c.total_vol > 50000000 ? "Tier-1 Volume" : "Tier-2 Volume";

        return `
            <tr>
                <td><strong>${c.coin}</strong></td>
                <td>${c.total_trades.toLocaleString()}</td>
                <td>$${c.total_vol.toLocaleString()}</td>
                <td class="${pnlClass}"><strong>${pnlFormatted}</strong></td>
                <td>${c.win_rate}%</td>
                <td><span class="badge badge-primary">${rating}</span></td>
            </tr>
        `;
    }).join("");
}
