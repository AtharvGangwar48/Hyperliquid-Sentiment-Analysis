# Hyperliquid Trader Performance vs. Bitcoin Market Sentiment

> **Data Science Internship Challenge Submission**  
> An end-to-end quantitative study exploring the relationship between Hyperliquid perpetual trader execution performance and Bitcoin market sentiment (Fear & Greed Index).

---

## 🌟 Executive Overview & Key Findings

This repository contains a complete Data Science research project analyzing **211,224 trade execution records** across **32 trader accounts** and **246 perpetual contract assets** ($1.191 Billion USD total volume) merged with the **Bitcoin Fear & Greed Index** (2023–2025).

### Key Insights:
- **Extreme Fear Surge ($8.18M/day Volume):** Traders deploy maximum capital during Extreme Fear, accumulating long positions (51.10% BUY bias) at bottom valuations and generating $52.8k daily net PnL.
- **Extreme Greed Efficiency (Profit Factor 11.02 & 89.17% Win Rate):** In Extreme Greed, top traders aggressively flip to a **55.14% SHORT bias**, securing an 89.17% Win Rate and an 11.02 Profit Factor.
- **Contract-Specific Alpha (`@107` Contract):** Contract `@107` incurred -$136k losses in Extreme Fear but generated **+$1.99M net PnL** during Extreme Greed.
- **Statistical Significance ($p < 10^{-15}$):** Chi-Square testing confirms that trader directional bias is strongly dependent on market sentiment regimes ($\chi^2 = 196.42, p = 2.41 \times 10^{-42}$).

---

## 📁 Repository Deliverables & Structure

```
.
├── submission_report.md           # Full Executive Data Science Report (Methodology, Hypothesis Tests, Strategies)
├── trader_sentiment_analysis.ipynb # Fully Executable Jupyter Notebook (EDA, Statistical Testing, ML Models)
├── index.html                     # Interactive Glassmorphic Web Dashboard
├── style.css                      # Modern CSS Styling & Design Tokens
├── app.js                         # Dynamic Dashboard Logic & Chart.js Integration
├── dashboard_data.json            # Processed & Aggregated JSON Dataset (Ground-Truth Metrics)
├── fear_greed_index.csv           # Bitcoin Fear & Greed Dataset (2018-2025)
├── historical_data.csv            # Hyperliquid Historical Trader Executions (211,224 records)
└── README.md                      # Project Documentation & Usage Guide
```

---

## 🚀 Quick Start & How to Run

### 1. View Interactive Web Dashboard
Simply open `index.html` in any modern web browser or serve locally:
```bash
python3 -m http.server 8000
```
Then navigate to `http://localhost:8000` to interact with dynamic sentiment charts, trader leaderboards, coin matrices, and strategy backtesters.

### 2. Inspect Jupyter Notebook
Open `trader_sentiment_analysis.ipynb` in VS Code or JupyterLab:
```bash
jupyter notebook trader_sentiment_analysis.ipynb
```

### 3. Read Executive Submission Report
View `submission_report.md` in any markdown viewer for full analytical detail, equations, statistical test outputs, and strategy playbooks.

---

## 📊 Summary Performance Matrix

| Market Sentiment Regime | Total Trades | Total Volume ($M) | Net Realized PnL ($) | Win Rate (%) | Profit Factor | BUY / Long Bias (%) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Extreme Fear** (0-24) | 21,400 | $114.48M | +$739,110 | 76.22% | 2.16 | **51.10%** |
| **Fear** (25-44) | 61,837 | $483.32M | +$3,357,155 | 87.29% | 6.66 | 48.95% |
| **Neutral** (45-54) | 37,686 | $180.24M | +$1,292,921 | 82.39% | 4.32 | 50.33% |
| **Greed** (55-74) | 50,303 | $288.58M | +$2,150,129 | 76.89% | 3.03 | 48.86% |
| **Extreme Greed** (75-100) | 39,992 | $124.47M | +$2,715,171 | **89.17%** | **11.02** | **44.86% (55.14% Short)** |
| **OVERALL** | **211,224** | **$1,191.08M** | **+$10,254,486** | **83.20%** | **4.85** | **48.82%** |

---
*Built as a Data Science Internship Challenge Solution.*
