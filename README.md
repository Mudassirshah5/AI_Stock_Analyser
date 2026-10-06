# 📈 AI Stock Analyzer

An educational and research tool that analyzes stocks using real market data, financial information, news, and AI, and shows the evidence behind every result.

Built as the final project of the **KPITB 3-Month AI & Machine Learning Training Program**.

> ⚠️ **Disclaimer:** This project is for educational and research purposes only. It is **not financial advice**. Do not make investment decisions based on its output.

---

## 💡 The Problem

To understand a stock, people have to check prices, financial statements, indicators, and news in many different places. This project brings all of that into one system and makes the analysis easier to understand.

## ✨ Features

- **Real market data:** live prices and historical data for a chosen stock
- **Financial information:** key company financials collected automatically
- **Relevant news:** recent headlines related to the company
- **Python calculations:** financial metrics are computed in code *before* anything reaches the AI model
- **AI assessment:** Google Gemini returns a structured **BUY vs SELL** assessment with supporting reasoning
- **Evidence Trace:** shows which factors support the assessment and which ones contradict it
- **Evidence Quality rating:** shows how reliable the underlying data is (HIGH / MODERATE / LOW)

## 🔧 How It Works

1. **Collect:** the app gathers market data, financial information, and news.
2. **Process:** Python code cleans the data and runs the calculations.
3. **Analyze:** the prepared evidence is sent to Google Gemini in a structured format.
4. **Present:** the app displays the BUY vs SELL assessment together with the Evidence Trace and Evidence Quality.

The goal is not just to get an AI answer. It is to show the evidence behind it and be transparent about what the system knows and what it doesn't.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Backend / data layer | Server-side API layer |
| Calculations | Python |
| AI model | Google Gemini |
| Data | Market data, financial data, and news APIs |

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- Python 3.9 or later
- A Google Gemini API key
- API keys for the market data and news providers you use

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>

# 2. Install frontend dependencies
npm install

# 3. Install Python dependencies
pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file in the project root and add your keys:

```env
GEMINI_API_KEY=your_gemini_api_key
# Add your market data and news API keys here
```

> Never commit your `.env` file or API keys to GitHub.

### Run the App

```bash
npm run dev
```

Then open the local address shown in your terminal.

## 📚 What I Learned

- Connecting APIs and external data sources to an AI application
- Running financial calculations in Python before data reaches the model
- How much data quality and missing information matter in AI systems
- Designing AI output that is backed by evidence
- Good AI should present both supporting and conflicting evidence, not unnecessary confidence

## ⚠️ Limitations

- The assessment is an evidence-based estimate, **not a guaranteed prediction**.
- Results depend on the quality and availability of the data sources.
- Missing or incomplete data lowers the Evidence Quality rating.
- The tool does not account for every factor that moves a stock price.

## 🔮 Future Improvements

- Support for more markets and data sources
- More technical and fundamental indicators
- Comparison of multiple stocks side by side
- Exportable reports

## 🎓 About

Created by **Muhammad Mudassir Shah** as the final project of the KPITB AI & ML Training Program.

- 🌐 Portfolio: [mudassirshah5.github.io/portfolio](https://mudassirshah5.github.io/portfolio)
- 📧 Email: mmudassirshah634@gmail.com

Thank you to my teachers, Sir Kamran, Sir Adil, and Sir Umar, and to KPITB for the guidance and opportunity.

## 📄 License

This project is for educational purposes. Add a license of your choice (for example, MIT) if you want others to reuse the code.

---

*Educational & research tool, not financial advice.*
