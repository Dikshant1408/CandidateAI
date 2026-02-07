# CandidateAI - Neural Talent Evaluation Dashboard

CandidateAI is a sophisticated HR recruitment tool that leverages **Gemini 3 Flash** to perform deep-vector analysis of job candidates. It evaluates talent across three critical modern dimensions: Crisis Management, Sustainability Knowledge, and Team Motivation.

## 🚀 Features

- **Neural Evaluation**: Real-time analysis of candidate resumes and achievements using Google GenAI.
- **Talent Pool Management**: Full CRUD-capable view of 40+ realistic candidate profiles.
- **Side-by-Side Comparison**: Multi-candidate "Delta Analysis" view with horizontal matrix scrolling and compact mode.
- **Global Leaderboard**: Ranking system based on aggregate AI scores.
- **Talent DNA Mapping**: Visual radar charts for competency visualization.
- **Market Analytics**: Trend analysis and pool quality metrics.
- **Settings & Theme**: Functional dark mode, model selection, and auto-evaluation settings.

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS.
- **Icons**: Lucide React.
- **Charts**: Recharts (Radar, Area, Bar).
- **AI**: @google/genai (Gemini 3 Flash).
- **Data**: Custom deterministic mock generator (40 profiles).

## 📊 Database Architecture

The system is designed to be MySQL-compatible. See `db_schema.sql` for the full definition.

### Tables:
- `candidates`: Primary profile data (experience, skills, achievements).
- `evaluations`: AI-generated scores and summaries linked to candidates.
- `rankings`: Cached ranking table for performance-critical leaderboard views.

## 🤖 AI Logic (Prompts)

The evaluation engine uses a structured JSON output prompt evaluating:
1. **Crisis Management**: Ability to handle outages and high-pressure scenarios.
2. **Sustainability**: Knowledge of CSR, ESG, and green tech.
3. **Team Motivation**: Leadership skills and cultural impact.

## 📦 Setup

1. The application automatically initializes with a sample set of 40 candidates.
2. Ensure your `process.env.API_KEY` is configured to enable live Gemini evaluations.
3. Use the **Overview** to see top performers or **Talent Pool** to trigger new evaluations.
