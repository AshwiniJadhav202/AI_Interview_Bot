from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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

conn = sqlite3.connect("database.db", check_same_thread=False)

cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS interviews(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT,
    answer TEXT,
    score INTEGER
)
""")

conn.commit()

# =========================
# MODELS
# =========================

class LoginData(BaseModel):
    email: str
    password: str


class SkillData(BaseModel):
    skills: str
    previous_question: str = ""


class InterviewData(BaseModel):
    question: str
    answer: str


# =========================
# TEST ROUTE
# =========================

@app.get("/")
def home():
    return {"message": "Backend Running Successfully"}


# =========================
# SAVE LOGIN
# =========================

@app.post("/save_login")
def save_login(data: LoginData):

    cursor.execute(
        "SELECT * FROM users WHERE email=?",
        (data.email,)
    )

    existing_user = cursor.fetchone()

    if existing_user:
        return {
            "message": "Login Successful"
        }

    cursor.execute(
        "INSERT INTO users(email,password) VALUES(?,?)",
        (data.email, data.password)
    )

    conn.commit()

    return {
        "message": "User Registered Successfully"
    }


# =========================
# QUESTIONS
# =========================

python_questions = [
    "What is inheritance in Python?",
    "What is polymorphism?",
    "Difference between list and tuple?",
    "Explain decorators in Python?",
    "What is encapsulation?",
    "What is multithreading?",
    "Explain exception handling?",
    "What is a constructor?",
    "Difference between deep copy and shallow copy?",
    "What is abstraction?"
]

java_questions = [
    "What is JVM?",
    "Explain OOP concepts?",
    "Difference between JDK and JRE?",
    "What is method overloading?",
    "What is overriding?",
    "Explain inheritance in Java?",
    "What is abstraction?",
    "Difference between ArrayList and LinkedList?",
    "What is multithreading?",
    "Explain exception handling?"
]

web_questions = [
    "What is React?",
    "What is JavaScript promise?",
    "Difference between SQL and NoSQL?",
    "What is API?",
    "What is Flexbox?",
    "Explain CSS Grid?",
    "What is responsive design?",
    "Difference between GET and POST?",
    "What is JWT?",
    "What is REST API?"
]


@app.post("/question")
def get_question(data: SkillData):

    skills = data.skills.lower()

    if "python" in skills:
        questions = python_questions

    elif "java" in skills:
        questions = java_questions

    else:
        questions = web_questions

    available_questions = [
        q for q in questions
        if q != data.previous_question
    ]

    question = random.choice(available_questions)

    return {
        "question": question
    }


# =========================
# SCORE
# =========================

@app.post("/submit")
def submit_interview(data: InterviewData):

    answer = data.answer.strip()

    if len(answer) == 0:

        score = 0

        performance = "No Answer Given"

        suggestion = "Please practice technical concepts and communication."

    elif len(answer) < 20:

        score = 40

        performance = "Average"

        suggestion = "Try giving more detailed answers."

    elif len(answer) < 50:

        score = 70

        performance = "Good"

        suggestion = "Improve confidence and technical depth."

    else:

        score = 90

        performance = "Excellent"

        suggestion = "You are performing very well."

    cursor.execute(
        "INSERT INTO interviews(question,answer,score) VALUES(?,?,?)",
        (data.question, data.answer, score)
    )

    conn.commit()

    return {
        "score": score,
        "performance": performance,
        "suggestion": suggestion
    }