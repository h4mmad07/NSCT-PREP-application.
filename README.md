# NSCT PREP — National Skill Competency Test Preparation Platform

A state-of-the-art web preparation platform for BSCS / IT students preparing for the National Skill Competency Test (NSCT). Built with **Next.js 14**, **FastAPI**, **SQLAlchemy**, and **PostgreSQL / SQLite**.

---

## 🏛️ System Architecture

```text
                 NSCT PREP
                     │
       ┌─────────────┼─────────────┐
       │             │             │
   PRACTICE       MOCK TESTS    ANALYTICS
       │             │             │
       │             │             ├── Subjects & Topics
       │             │             ├── Weak Area Diagnostic
       │             │             └── Progress & Streaks
       │             │
       ├── Subject   ├── Full NSCT Simulation (100 Qs)
       ├── Topic     └── Custom Mock Test
       ├── Mixed
       ├── Weak Areas
       ├── Mistakes
       └── Challenge
                     │
                     ↓
         TEST GENERATION ENGINE
       (Largest-Remainder Allocation)
                     │
                     ↓
       IMMUTABLE TEST SNAPSHOTS
       (Secure Server Evaluation)
                     │
                     ↓
          RESULT & REVIEW ANALYTICS
```

---

## 🚀 Quickstart Guide

### 1. Backend Setup (FastAPI & SQLAlchemy)

```bash
# Navigate to backend
cd backend

# Activate virtual environment
.\venv\Scripts\activate   # Windows
# source venv/bin/activate # Linux/macOS

# Run Database Initialization & Verification
python init_and_test.py

# Start FastAPI Server
python app/main.py
```
* Backend API will run at: `http://localhost:8000`
* Interactive Swagger Docs: `http://localhost:8000/docs`

### 2. Frontend Setup (Next.js 14 & Tailwind CSS)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Next.js Development Server
npm run dev
```
* Web Application will run at: `http://localhost:3000`

---

## 📚 Official NSCT Competency Taxonomy (Seeded in DB)

1. **Problem Solving & Analytical Skills** — 20% Weight (16 Topics)
2. **Programming [C++, Java, Python]** — 10% Weight (16 Topics)
3. **Data Structures & Algorithms** — 10% Weight (12 Topics)
4. **Operating Systems** — 5% Weight (12 Topics)
5. **Software Engineering** — 10% Weight (16 Topics)
6. **Web Development** — 10% Weight (17 Topics)
7. **AI / Machine Learning & Data Analytics** — 10% Weight (17 Topics)
8. **Cyber Security** — 5% Weight (16 Topics)
9. **Databases** — 10% Weight (17 Topics)
10. **Computer Networks & Cloud Computing** — 10% Weight (10 Topics)

---

## ⚙️ Core Technical Features

* **Unified Test Generation Engine**: Single dynamic engine powering all 9 modes (Quick, Subject, Topic, Mixed, Weak Areas, Mistakes, Revision, Challenge, Full Mock).
* **Largest-Remainder Proportional Allocation**: Guarantees mathematically fair integer question distribution for full mocks and multi-subject tests.
* **Anti-Repetition Intelligence**: Automatically avoids questions seen in the student's recent test sessions.
* **Strict Server-Side Answer Privacy**: `is_correct` and explanations are omitted from the browser payload during active exam sessions.
* **Live Autosave & Authoritative Timer**: Saves answers in real-time and validates completion time server-side.
* **Weak Area Diagnostic Formula**: $\text{Weakness Score} = (100 - \text{Accuracy}) \times \ln(\text{Attempts} + 1)$.
* **Admin Question Bank Manager**: Add, edit, preview, and categorize questions across all competencies.
