import os
import sqlite3
from flask import g, current_app


SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS students (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	roll_no TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS attendance (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	student_id INTEGER NOT NULL,
	timestamp TEXT NOT NULL,
	FOREIGN KEY(student_id) REFERENCES students(id)
);
"""


def ensure_dirs():
	os.makedirs('data/dataset', exist_ok=True)


def get_db():
	if 'db' not in g:
		database_path = current_app.config['DATABASE']
		g.db = sqlite3.connect(database_path, detect_types=sqlite3.PARSE_DECLTYPES)
		g.db.row_factory = sqlite3.Row
	return g.db


def init_db():
	db = get_db()
	db.executescript(SCHEMA_SQL)
	db.commit()
