
# CandidateAI - Neural Talent Evaluation Dashboard

A high-performance recruitment intelligence platform leveraging **Google Gemini AI** to quantify intangible professional soft skills.

## 🚀 Key Features

- **Neural Profiling**: Uses Gemini 3 Flash to evaluate candidates on Crisis Mitigation, Sustainability knowledge, and Team Leadership.
- **Top 10 Leaderboard**: Dynamic ranking of candidates based on weighted aggregate AI scores.
- **Skill Heatmap**: Visual intensity matrix of candidate competencies.
- **Comparison Matrix**: Side-by-side "Delta Analysis" for final-round selection.
- **Realistic Data**: Deterministic generation of 40 diverse professional profiles.
- **Mantine UI**: Built with a production-grade component library for maximum accessibility and responsiveness.

## 🛠 Setup Instructions

### Prerequisites
- Node.js (Latest LTS)
- Browser with ES Module support

### Quick Start
1. **Clone the project**:
   ```bash
   git clone [repository-url]
   cd candidate-ai
   ```
2. **Environment Configuration**:
   Create a `.env` file or set the environment variable:
   ```env
   API_KEY=your_google_gemini_api_key
   ```
3. **Launch**:
   This app uses Vite for development.
   ```bash
   npm install
   npm run dev
   ```

## 📊 Database Management

The provided `db_schema.sql` is compatible with MySQL 8.0+. To migrate:

1. Connect to your MySQL instance.
2. Run the commands in `db_schema.sql`.
3. The schema includes 40 sample candidate records and initial evaluation benchmarks.

## 🤖 AI Logic

The evaluation engine uses specific "Neural Prompts" (see `AI_PROMPTS.md`) to analyze professional history. It calculates:
- **Crisis Response**: Based on incident handling and outage management.
- **Sustainability**: Based on ESG, CSR, and green tech initiatives.
- **Team Motivation**: Based on leadership, mentoring, and cultural impact.

---
*Built with ❤️ by a World-Class Senior Frontend Engineer.*
