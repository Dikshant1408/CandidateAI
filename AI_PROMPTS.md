# CandidateAI Neural Evaluation Prompts

This document outlines the prompt engineering strategy used to evaluate candidates across three specific dimensions using the **Gemini 3 Flash** model.

## 1. Evaluation Dimensions

### A. Crisis Management
**Objective**: Determine the candidate's ability to remain composed, make strategic decisions, and recover from failures under high-pressure scenarios.
**Target Indicators**: Incident response history, risk mitigation skills, technical resilience.

### B. Sustainability Knowledge
**Objective**: Assess the candidate's commitment to and understanding of environmental, social, and corporate governance (ESG) principles.
**Target Indicators**: CSR project experience, green tech familiarity, ethical supply chain knowledge.

### C. Team Motivation
**Objective**: Evaluate leadership style and cultural impact, specifically how the candidate inspires and retains talent.
**Target Indicators**: Mentorship history, conflict resolution, DEI initiatives, team-growth achievements.

---

## 2. Core Neural Prompt (Consolidated)

The system uses a single high-efficiency prompt to extract all three dimensions as structured JSON.

```markdown
Act as a world-class HR Technology Specialist and Organizational Psychologist. 
Perform a deep-vector neural analysis of the following candidate:

Candidate Name: [NAME]
Role: [ROLE]
Experience: [YEARS]
Skills: [SKILLS]
Achievements: [ACHIEVEMENTS]
Bio: [BIO]

Your task is to analyze their career trajectory and specific accomplishments to generate three distinct performance scores (0-100) and a summary.

### SCORING CRITERIA:

1. **Crisis Management Score**:
   - High score (90+): Managed catastrophic outages, saved multi-million dollar deals from collapse, or stabilized teams during major restructuring.
   - Low score (<50): No documented history of high-pressure leadership or risk mitigation.

2. **Sustainability Score**:
   - High score (90+): Directly implemented ESG frameworks, reduced carbon footprints, or led green product development.
   - Low score (<50): No mention of corporate responsibility or sustainability initiatives.

3. **Team Motivation Score**:
   - High score (90+): Built teams from scratch, mentored juniors to senior roles, or led successful cultural transformations.
   - Low score (<50): Purely individual contributor history with no leadership or soft-skill indicators.

### RESPONSE FORMAT:
You MUST respond with valid JSON using the following schema:
{
  "crisisManagementScore": number,
  "sustainabilityScore": number,
  "teamMotivationScore": number,
  "summary": "concise 2-sentence analysis of their primary value proposition"
}
```

---

## 3. Alternative Individual Prompts

If using separate calls for deeper granularity:

### Crisis Management Deep-Dive
> "Analyze the achievement list: '[ACHIEVEMENTS]'. Extract evidence of risk management and high-pressure decision making. On a scale of 0-100, how prepared is this candidate to lead a mission-critical recovery effort? Explain your reasoning in 50 words."

### Sustainability Deep-Dive
> "Review the candidate's background in '[ROLE]'. Cross-reference their skills '[SKILLS]' with current ESG standards. How effectively could they lead a 'Green Tech' transition within a legacy organization? Score 0-100."

### Team Motivation Deep-Dive
> "Based on the bio '[BIO]', assess the candidate's emotional intelligence and leadership potential. Do they demonstrate the empathy and strategic vision required to motivate a diverse, global engineering team? Score 0-100."
