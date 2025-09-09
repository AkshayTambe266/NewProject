import os
import base64
import io
from datetime import datetime

from flask import Flask, render_template, request, jsonify, send_file, g

from database import init_db, get_db, ensure_dirs
from face_service import FaceService


def create_app():
	ensure_dirs()
	app = Flask(__name__)
	app.config['DATABASE'] = os.path.join('data', 'attendance.db')

	# Initialize DB and face service
	with app.app_context():
		init_db()

	app.face_service = FaceService(model_path=os.path.join('data', 'trainer.yml'), dataset_dir=os.path.join('data', 'dataset'))

	@app.teardown_appcontext
	def close_connection(exception):
		db = g.pop('db', None)
		if db is not None:
			db.close()

	@app.route('/')
	def index():
		return render_template('index.html')

	@app.route('/register')
	def register_page():
		return render_template('register.html')

	@app.route('/attendance')
	def attendance_page():
		return render_template('attendance.html')

	@app.route('/logs')
	def logs_page():
		db = get_db()
		rows = db.execute('''
			SELECT attendance.id, students.name, students.roll_no, attendance.timestamp
			FROM attendance
			JOIN students ON students.id = attendance.student_id
			ORDER BY attendance.timestamp DESC
			LIMIT 200
		''').fetchall()
		return render_template('logs.html', logs=rows)

	@app.route('/api/students', methods=['GET'])
	def list_students():
		db = get_db()
		rows = db.execute('SELECT id, name, roll_no FROM students ORDER BY roll_no ASC').fetchall()
		return jsonify([{'id': r['id'], 'name': r['name'], 'roll_no': r['roll_no']} for r in rows])

	@app.route('/api/register', methods=['POST'])
	def api_register():
		name = request.form.get('name', '').strip()
		roll_no = request.form.get('roll_no', '').strip()
		image_b64 = request.form.get('image')
		if not name or not roll_no or not image_b64:
			return jsonify({'ok': False, 'error': 'Missing fields'}), 400

		image_bytes = base64.b64decode(image_b64.split(',')[-1])
		student_id = app.face_service.save_sample_and_register(name=name, roll_no=roll_no, image_bytes=image_bytes)
		return jsonify({'ok': True, 'student_id': student_id})

	@app.route('/api/train', methods=['POST'])
	def api_train():
		app.face_service.train()
		return jsonify({'ok': True})

	@app.route('/api/recognize', methods=['POST'])
	def api_recognize():
		image_b64 = request.form.get('image')
		if not image_b64:
			return jsonify({'ok': False, 'error': 'Missing image'}), 400
		image_bytes = base64.b64decode(image_b64.split(',')[-1])
		student, confidence = app.face_service.recognize(image_bytes=image_bytes)
		if student is None:
			return jsonify({'ok': True, 'recognized': False})

		# Mark attendance once per day per student
		db = get_db()
		today = datetime.now().strftime('%Y-%m-%d')
		existing = db.execute(
			'SELECT id FROM attendance WHERE student_id = ? AND date(timestamp) = ?',
			(student['id'], today)
		).fetchone()
		if existing is None:
			db.execute('INSERT INTO attendance (student_id, timestamp) VALUES (?, ?)', (student['id'], datetime.now()))
			db.commit()

		return jsonify({'ok': True, 'recognized': True, 'student': student, 'confidence': float(confidence)})

	@app.route('/export.csv')
	def export_csv():
		db = get_db()
		rows = db.execute('''
			SELECT students.roll_no, students.name, attendance.timestamp
			FROM attendance
			JOIN students ON students.id = attendance.student_id
			ORDER BY attendance.timestamp DESC
		''').fetchall()
		output = io.StringIO()
		output.write('roll_no,name,timestamp\n')
		for r in rows:
			output.write(f"{r['roll_no']},{r['name']},{r['timestamp']}\n")
		mem = io.BytesIO(output.getvalue().encode('utf-8'))
		mem.seek(0)
		return send_file(mem, mimetype='text/csv', as_attachment=True, download_name='attendance.csv')

	return app


if __name__ == '__main__':
	app = create_app()
	app.run(host='0.0.0.0', port=5000, debug=True)
