-- CandidateAI MySQL Schema
-- Optimized for Talent Evaluation and AI-Assisted Recruitment

CREATE DATABASE IF NOT EXISTS candidate_ai;
USE candidate_ai;

-- 1. Candidates Table
-- Stores primary biographical and professional data
CREATE TABLE IF NOT EXISTS candidates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    experience_years INT NOT NULL,
    role VARCHAR(100) NOT NULL,
    skills TEXT, -- Comma-separated values
    bio TEXT,
    achievements TEXT, -- JSON Array of strings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Evaluations Table
-- Stores AI-generated scores and narrative summaries
CREATE TABLE IF NOT EXISTS evaluations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id VARCHAR(50),
    crisis_management_score DECIMAL(5,2),
    sustainability_score DECIMAL(5,2),
    team_motivation_score DECIMAL(5,2),
    summary TEXT,
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);

-- 3. Rankings Table
-- Stores aggregated performance data for leaderboard efficiency
CREATE TABLE IF NOT EXISTS rankings (
    candidate_id VARCHAR(50) PRIMARY KEY,
    total_score DECIMAL(5,2),
    ranking_pos INT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);

-- ==========================================================
-- SAMPLE DATASET (40 CANDIDATES)
-- ==========================================================

INSERT INTO candidates (id, name, experience_years, role, skills, bio, achievements) VALUES
('c-1', 'James Smith', 12, 'Senior Software Engineer', 'React,Node.js,Cloud Architecture', 'Cloud expert.', '["Led migration to K8s", "Optimized DB for 40% speedup"]'),
('c-2', 'Mary Johnson', 8, 'Product Manager', 'Agile,Strategic Planning', 'Growth-focused PM.', '["Launched MVP in 3 months", "Managed 1M+ MAU roadmap"]'),
('c-3', 'Robert Williams', 15, 'Operations Director', 'Risk Mitigation,Supply Chain', 'Operations veteran.', '["Reduced overhead by 22%", "Negotiated 10 high-value contracts"]'),
('c-4', 'Patricia Brown', 10, 'Sustainability Lead', 'CSR,ESG Reporting', 'Green initiative expert.', '["Achieved carbon neutrality", "Published 2023 ESG Report"]'),
('c-5', 'John Jones', 5, 'UX Designer', 'Data Vis,React,Figma', 'Creative data designer.', '["Won 2022 Design Award", "Built atomic design system"]'),
('c-6', 'Linda Garcia', 9, 'Data Scientist', 'Python,ML,AI Ethics', 'AI specialist.', '["Deployed fraud detection model", "Optimized recommendation engine"]'),
('c-7', 'Michael Miller', 14, 'CTO', 'Architecture,Leadership', 'Technology leader.', '["Scaled platform to 10M users", "Built engineering team from 0 to 50"]'),
('c-8', 'Barbara Davis', 7, 'Marketing Strategy Head', 'Growth Hacking,SEO', 'Strategy specialist.', '["Increased conversion by 50%", "Managed $5M annual ad spend"]'),
('c-9', 'William Rodriguez', 11, 'Project Manager', 'Agile,Scrum,Jira', 'Efficiency expert.', '["Delivered 10+ projects on time", "Streamlined dev workflow"]'),
('c-10', 'Elizabeth Martinez', 6, 'HR Business Partner', 'Conflict Resolution,DEI', 'People person.', '["Reduced turnover by 15%", "Implemented new DEI framework"]'),
('c-11', 'Richard Hernandez', 13, 'Senior Software Engineer', 'Go,Docker,AWS', 'Backend specialist.', '["Built high-concurrency API", "Reduced cloud costs by 30%"]'),
('c-12', 'Susan Lopez', 4, 'UX Designer', 'UI,Prototyping,User Research', 'User-centric designer.', '["Led research for flagship app", "Improved NPS by 20 points"]'),
('c-13', 'Joseph Gonzalez', 9, 'Product Manager', 'B2B,Product Strategy', 'Enterprise PM.', '["Closed $1M enterprise deal", "Pivoted B2B strategy successfully"]'),
('c-14', 'Jessica Wilson', 8, 'Sustainability Lead', 'Green Tech,Supply Chain', 'Eco specialist.', '["Implemented circular economy model", "Won Green Tech Award 2023"]'),
('c-15', 'Thomas Anderson', 12, 'Operations Director', 'Logistics,Inventory', 'Supply chain pro.', '["Fixed global supply chain delay", "Automated inventory management"]'),
('c-16', 'Sarah Thomas', 5, 'Data Scientist', 'R,Statistics,Tableau', 'Analytic mind.', '["Uncovered $500k saving via data", "Built churn prediction model"]'),
('c-17', 'Charles Taylor', 15, 'CTO', 'Security,Cloud,Node.js', 'Infra expert.', '["Hardened system against DDOS", "Migrated legacy to serverless"]'),
('c-18', 'Karen Moore', 7, 'Marketing Strategy Head', 'PPC,Social Media', 'Social growth pro.', '["Grew followers by 200%", "Executed viral campaign"]'),
('c-19', 'Christopher Jackson', 10, 'Project Manager', 'Prince2,Budgeting', 'Execution master.', '["Recovered failing project", "Managed $2M budget"]'),
('c-20', 'Nancy Martin', 11, 'HR Business Partner', 'Coaching,Recruitment', 'Talent specialist.', '["Hired 100+ devs in 1 year", "Built mentoring program"]'),
('c-21', 'Daniel Lee', 9, 'Senior Software Engineer', 'Java,Spring Boot', 'System architect.', '["Designed microservices platform", "Modernized core banking system"]'),
('c-22', 'Dorothy Perez', 6, 'Product Manager', 'Fintech,Mobile', 'App expert.', '["Launched top-rated mobile wallet", "Integrated 5 payment gateways"]'),
('c-23', 'Paul Thompson', 14, 'Operations Director', 'Process Improvement', 'Efficiency pro.', '["Six Sigma implementation", "Reduced error rate by 40%"]'),
('c-24', 'Lisa White', 8, 'Sustainability Lead', 'Renewables,Solar', 'Energy specialist.', '["Installed 1MW solar array", "Negotiated power purchase deal"]'),
('c-25', 'Mark Harris', 5, 'UX Designer', 'Interaction Design', 'Digital creative.', '["Designed intuitive dash", "Conducted 50+ user interviews"]'),
('c-26', 'Sandra Clark', 7, 'Data Scientist', 'NLP,GPT-4,Python', 'ML expert.', '["Built AI customer support bot", "Processed 1B+ text records"]'),
('c-27', 'Kenneth Lewis', 13, 'CTO', 'Innovation,R&D', 'Visionary leader.', '["Developed 3 new patents", "Led company R&D lab"]'),
('c-28', 'Ashley Robinson', 6, 'Marketing Strategy Head', 'Branding,Copywriting', 'Brand master.', '["Complete brand refresh", "Won Creative Circle Award"]'),
('c-29', 'George Walker', 11, 'Project Manager', 'Lean,Kaizen', 'Continuous improvement.', '["Reduced waste by 30%", "Trained 50 staff in Lean"]'),
('c-30', 'Betty Young', 12, 'HR Business Partner', 'Labor Law,Benefits', 'Compliance pro.', '["Settled major union dispute", "Overhauled benefits package"]'),
('c-31', 'Steven Allen', 10, 'Senior Software Engineer', 'C++,Embedded', 'Hardcore coder.', '["Optimized kernel driver", "Built firmware for 1M IoT units"]'),
('c-32', 'Margaret King', 9, 'Product Manager', 'E-commerce,SEO', 'Sales PM.', '["Boosted online sales by 60%", "Personalized checkout flow"]'),
('c-33', 'Edward Wright', 15, 'Operations Director', 'Global Expansion', 'Global ops pro.', '["Opened 5 new international hubs", "Navigated complex customs laws"]'),
('c-34', 'Ruth Scott', 8, 'Sustainability Lead', 'Waste Management', 'Recycling expert.', '["Zero-waste office goal met", "Implemented composting program"]'),
('c-35', 'Brian Green', 5, 'UX Designer', 'Motion Design', 'Animatic specialist.', '["Built motion design system", "Created 10+ high-fidelity prototypes"]'),
('c-36', 'Alice Baker', 7, 'Data Scientist', 'Deep Learning,PyTorch', 'Neural net pro.', '["Built image recognition API", "Reduced training time by 50%"]'),
('c-37', 'Ronald Adams', 14, 'CTO', 'Blockchain,Web3', 'Web3 pioneer.', '["Launched decentralized protocol", "Managed $10M treasury"]'),
('c-38', 'Helen Nelson', 6, 'Marketing Strategy Head', 'Events,PR', 'Publicity pro.', '["Organized global conference", "Featured in TechCrunch"]'),
('c-39', 'Kevin Hill', 11, 'Project Manager', 'Risk,Compliance', 'Regulatory PM.', '["Ensured SOC2 compliance", "Led audit for Fortune 500 client"]'),
('c-40', 'Laura Carter', 12, 'HR Business Partner', 'Strategy,Culture', 'Culture builder.', '["Won Best Place to Work", "Revamped annual review system"]');

-- Sample Evaluations (Generated for top candidates)
INSERT INTO evaluations (candidate_id, crisis_management_score, sustainability_score, team_motivation_score, summary) VALUES
('c-1', 92.00, 75.00, 88.00, 'Exceptional technical lead with high crisis resilience.'),
('c-4', 85.00, 98.00, 80.00, 'Top-tier sustainability leader with deep ESG knowledge.'),
('c-7', 95.00, 60.00, 92.00, 'Visionary CTO; handles high-pressure scaling effortlessly.'),
('c-10', 70.00, 70.00, 95.00, 'Human-centric HR lead with outstanding motivational skills.'),
('c-14', 78.00, 96.00, 82.00, 'Strong eco-conscious PM with award-winning achievements.');

-- Sample Rankings (Aggregated based on evaluations)
INSERT INTO rankings (candidate_id, total_score, ranking_pos) VALUES
('c-1', 85.00, 1),
('c-7', 82.33, 2),
('c-4', 87.66, 3), -- Note: Real calculation would occur via trigger or app logic
('c-10', 78.33, 4),
('c-14', 85.33, 5);
