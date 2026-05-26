from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import random

app = FastAPI()

# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# DATABASE
# =========================

conn = sqlite3.connect(
    "database.db",
    check_same_thread=False
)

cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    password TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS interviews(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    score INTEGER,
    performance TEXT,
    suggestion TEXT
)
""")

conn.commit()

# =========================
# QUESTIONS
# =========================

python_questions = [
    "What is inheritance in Python?",
    "Explain polymorphism in Python.",
    "Difference between list and tuple?",
    "Explain OOP concepts.",
    "What is encapsulation?",
    "What is abstraction?",
    "Explain decorators in Python.",
    "What are lambda functions?",
    "What is exception handling?",
    "Difference between deep copy and shallow copy?"
]

java_questions = [
    "What is JVM?",
    "Difference between JDK and JRE?",
    "Explain constructor in Java.",
    "What is encapsulation?",
    "What is inheritance in Java?",
    "Explain polymorphism.",
    "Difference between interface and abstract class?",
    "What is method overloading?",
    "What is method overriding?",
    "What is multithreading?"
]

react_questions = [
    "What is React?",
    "Explain useState hook.",
    "Difference between props and state?",
    "What is JSX?",
    "What is useEffect?",
    "Explain virtual DOM.",
    "What are React hooks?",
    "What is component lifecycle?",
    "Difference between functional and class components?",
    "What is state management?"
]

sql_questions = [
    "What is primary key?",
    "Difference between SQL and NoSQL?",
    "Explain joins.",
    "What is normalization?",
    "What is foreign key?",
    "Difference between DELETE and TRUNCATE?",
    "What is indexing?",
    "What is GROUP BY?",
    "What is HAVING clause?",
    "Difference between WHERE and HAVING?"
]

default_questions = [
    "Tell me about yourself.",
    "Why should we hire you?",
    "Explain your final year project.",
    "What are your strengths?",
    "What are your weaknesses?",
    "Where do you see yourself in 5 years?",
    "Why do you want this job?",
    "Tell me about your achievements.",
    "How do you handle pressure?",
    "Why should we select you?"
]

# =========================
# LOGIN API
# =========================

@app.post("/save_login")
def save_login(data: dict):

    email = data["email"]
    password = data["password"]

    cursor.execute(
        "SELECT * FROM users WHERE email=?",
        (email,)
    )

    existing = cursor.fetchone()

    if existing:

        return {
            "message": "Login Successful"
        }

    cursor.execute(
        """
        INSERT INTO users(email,password)
        VALUES(?,?)
        """,
        (email, password)
    )

    conn.commit()

    return {
        "message": "User Registered"
    }

# =========================
# QUESTION API
# =========================

@app.post("/question")
def question(data: dict):

    skills = data["skills"]

    asked_questions = data.get(
        "asked_questions",
        []
    )

    questions = []

    for skill in skills:

        skill = skill.lower()

        if skill == "python":
            questions.extend(python_questions)

        elif skill == "java":
            questions.extend(java_questions)

        elif skill == "react":
            questions.extend(react_questions)

        elif skill == "sql":
            questions.extend(sql_questions)

    if len(questions) == 0:
        questions = default_questions

    # REMOVE REPEATED QUESTIONS
    available_questions = [

        q for q in questions

        if q not in asked_questions
    ]

    # IF ALL QUESTIONS USED
    if len(available_questions) == 0:

        return {
            "question": "Interview Completed"
        }

    q = random.choice(
        available_questions
    )

    return {
        "question": q
    }

# =========================
# SUBMIT API
# =========================

@app.post("/submit")
def submit(data: dict):

    email = data["email"]

    answers = data["answers"]

    total_score = 0

    total_questions = len(answers)

    if total_questions == 0:

        return {
            "score": 0,
            "performance": "No Interview Attempted",
            "suggestion": "Please answer interview questions."
        }

    technical_words = [
        "python",
        "java",
        "react",
        "sql",
        "database",
        "api",
        "class",
        "object",
        "function",
        "inheritance",
        "html",
        "css",
        "javascript"
    ]

    for ans in answers:

        ans = ans.strip().lower()

        if len(ans) == 0:

            score = 0

        elif len(ans.split()) < 5:

            score = 20

        elif len(ans.split()) < 20:

            score = 50

        else:

            score = 75

        bonus = 0

        for word in technical_words:

            if word in ans:
                bonus += 2

        score += bonus

        if score > 100:
            score = 100

        total_score += score

    final_score = int(
        total_score / total_questions
    )

    # =========================
    # PERFORMANCE
    # =========================

    if final_score >= 85:

        performance = "Excellent Performance"

        suggestion = """
Strong technical knowledge.
Practice advanced interview questions.
Improve confidence and communication.
"""

    elif final_score >= 70:

        performance = "Good Performance"

        suggestion = """
Good technical understanding.
Practice more mock interviews.
Improve answer explanation.
"""

    elif final_score >= 40:

        performance = "Average Performance"

        suggestion = """
Improve technical concepts.
Practice coding and communication.
Give more detailed answers.
"""

    else:

        performance = "Poor Performance"

        suggestion = """
You need more preparation.
Practice technical concepts daily.
Improve communication skills.
"""

    # SAVE DB

    cursor.execute(
        """
        INSERT INTO interviews(
        email,
        score,
        performance,
        suggestion
        )
        VALUES(?,?,?,?)
        """,
        (
            email,
            final_score,
            performance,
            suggestion
        )
    )

    conn.commit()

    return {
        "score": final_score,
        "performance": performance,
        "suggestion": suggestion
    }
@app.get("/")
def home():
    return {"message": "Backend Running Successfully"}