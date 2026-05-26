import sqlite3

conn = sqlite3.connect("interview.db")

cursor = conn.cursor()

print("\nUSERS TABLE:\n")

cursor.execute("SELECT * FROM users")

print(cursor.fetchall())

print("\nINTERVIEW TABLE:\n")

cursor.execute("SELECT * FROM interviews")

print(cursor.fetchall())

conn.close()