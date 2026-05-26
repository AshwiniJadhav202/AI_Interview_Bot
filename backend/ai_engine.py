import os

import openai
from dotenv import load_dotenv

load_dotenv()
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
def generate_question(resume):

    prompt = f"""
You are a professional interviewer.

Resume:
{resume}

Ask one interview question based on resume.
"""

    res = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{
            "role": "user",
            "content": prompt
        }]
    )

    return res.choices[0].message.content


def evaluate_answer(question, answer):

    prompt = f"""
Evaluate answer.

Question:
{question}

Answer:
{answer}

Give:
technical score,
communication score,
confidence score,
feedback
"""

    res = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{
            "role": "user",
            "content": prompt
        }]
    )

    return res.choices[0].message.content