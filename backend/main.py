from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from jose import jwt, JWTError
from datetime import datetime, timedelta
import sqlite3
import random
from reportlab.pdfgen import canvas
from fastapi.responses import FileResponse

# =========================
# APP
# =========================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# JWT
# =========================
SECRET_KEY = "secret12345"
ALGORITHM = "HS256"
security = HTTPBearer()

def create_token(data: dict):
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(hours=2)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_admin(token=Depends(security)):
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Not admin")
        return payload
    except JWTError:
        raise HTTPException(status_code=403, detail="Invalid token")


# =========================
# DB
# =========================
conn = sqlite3.connect("database.db", check_same_thread=False)
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
# QUESTIONS (UNCHANGED)
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
]

java_questions = [
     "What is Java?",
    "What is JVM, JRE and JDK?",
    "What is OOP in Java?",
    "What is inheritance?",
    "What is polymorphism?",
    "What is abstraction?",
    "What is interface?",
    "What is multithreading?",
    "What is exception handling?",
    "What is garbage collection?",
]

react_questions = [
    "What is React?",
    "Explain useState hook.",
    "Difference between props and state?",
    "What is JSX?",
    "What is useEffect?",
    "Explain Virtual DOM.",
]

sql_questions = [
      "What is primary key?",
    "Difference between SQL and NoSQL?",
    "Explain joins.",
    "What is normalization?",
    "What is foreign key?",
    "Difference between DELETE and TRUNCATE?",
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
    "Why should we select you?",
]


# =========================
# LOGIN (FIXED - IMPORTANT)
# =========================
@app.post("/save_login")
def save_login(data: dict):

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return {
            "status": "error",
            "message": "Email or password missing",
            "role": "error"
        }

    # ADMIN LOGIN
    if email == "ashwini22022004@gmail.com" and password == "ashwini123":
        token = create_token({"email": email, "role": "admin"})
        return {
            "status": "success",
            "token": token,
            "role": "admin",
            "message": "Admin Login Successful"
        }

    # USER CHECK
    cursor.execute(
        "SELECT * FROM users WHERE email=? AND password=?",
        (email, password)
    )
    user = cursor.fetchone()

    if user:
        token = create_token({"email": email, "role": "user"})
        return {
            "status": "success",
            "token": token,
            "role": "user",
            "message": "Login Successful"
        }

    # REGISTER USER
    cursor.execute(
        "INSERT INTO users(email,password) VALUES(?,?)",
        (email, password)
    )
    conn.commit()

    token = create_token({"email": email, "role": "user"})

    return {
        "status": "success",
        "token": token,
        "role": "user",
        "message": "User Registered"
    }

# =========================
# QUESTION API
# =========================
@app.post("/question")
def get_question(data: dict):

    skills = data["skills"]
    asked = data.get("asked_questions", [])

    questions = []

    for s in skills:
        s = s.lower()
        if "python" in s:
            questions += python_questions
        elif "java" in s:
            questions += java_questions
        elif "react" in s:
            questions += react_questions
        elif "sql" in s:
            questions += sql_questions

    if not questions:
        questions = default_questions

    available = [q for q in questions if q not in asked]

    if not available:
        return {"question": "Interview Completed"}

    return {"question": random.choice(available)}


# =========================
# SUBMIT
# =========================
@app.post("/submit")
def submit(data: dict):

    email = data["email"]
    answers = data["answers"]

    total = 0

    for ans in answers:
        if len(ans.split()) < 5:
            total += 20
        elif len(ans.split()) < 20:
            total += 50
        else:
            total += 80

    score = int(total / max(len(answers), 1))

    if score >= 80:
        p, s = "Excellent", "Keep improving"
    elif score >= 50:
        p, s = "Good", "Practice more"
    else:
        p, s = "Average", "Needs improvement"

    cursor.execute(
        "INSERT INTO interviews(email,score,performance,suggestion) VALUES(?,?,?,?)",
        (email, score, p, s)
    )
    conn.commit()

    return {
        "score": score,
        "performance": p,
        "suggestion": s
    }


# =========================
# ADMIN APIs
# =========================
@app.get("/admin/users")
def get_users(admin=Depends(verify_admin)):
    cursor.execute("SELECT id,email FROM users")
    return {
        "users": [{"id": r[0], "email": r[1]} for r in cursor.fetchall()]
    }

@app.get("/admin/interviews")
def get_interviews(admin=Depends(verify_admin)):
    cursor.execute("SELECT email,score,performance,suggestion FROM interviews")
    return {
        "interviews": [
            {"email": r[0], "score": r[1], "performance": r[2], "suggestion": r[3]}
            for r in cursor.fetchall()
        ]
    }


# =========================
# PDF
# =========================
@app.get("/download-report/{email}")
def download_report(email: str):

    cursor.execute("""
        SELECT score,performance,suggestion
        FROM interviews
        WHERE email=?
        ORDER BY id DESC
        LIMIT 1
    """, (email,))

    data = cursor.fetchone()

    if not data:
        return {"message": "No report found"}

    file_name = f"{email}_report.pdf"

    c = canvas.Canvas(file_name)
    c.drawString(100, 750, "AI INTERVIEW REPORT")
    c.drawString(100, 700, f"Email: {email}")
    c.drawString(100, 650, f"Score: {data[0]}")
    c.drawString(100, 600, f"Performance: {data[1]}")
    c.drawString(100, 550, f"Suggestion: {data[2]}")
    c.save()

    return FileResponse(file_name, media_type="application/pdf")