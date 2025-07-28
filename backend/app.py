from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import cv2
import face_recognition
import numpy as np
import base64
import io
from PIL import Image
import os
from datetime import datetime, date
import json

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///attendance.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'

db = SQLAlchemy(app)

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Database Models
class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    department = db.Column(db.String(50), nullable=False)
    face_encoding = db.Column(db.Text, nullable=True)  # Store as JSON string
    photo_path = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(20), db.ForeignKey('student.student_id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time_in = db.Column(db.Time, nullable=False)
    status = db.Column(db.String(10), default='Present')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Initialize database
with app.app_context():
    db.create_all()

def encode_face_from_base64(image_data):
    """Convert base64 image to face encoding"""
    try:
        # Remove data URL prefix if present
        if 'base64,' in image_data:
            image_data = image_data.split('base64,')[1]
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Convert PIL image to numpy array
        image_array = np.array(image)
        
        # Find face locations and encodings
        face_locations = face_recognition.face_locations(image_array)
        
        if len(face_locations) == 0:
            return None, "No face detected in the image"
        
        if len(face_locations) > 1:
            return None, "Multiple faces detected. Please ensure only one face is visible"
        
        face_encodings = face_recognition.face_encodings(image_array, face_locations)
        
        if len(face_encodings) > 0:
            return face_encodings[0], None
        else:
            return None, "Could not encode face"
            
    except Exception as e:
        return None, f"Error processing image: {str(e)}"

@app.route('/')
def home():
    return jsonify({"message": "Smart Attendance System API", "status": "running"})

@app.route('/api/students', methods=['GET'])
def get_students():
    """Get all students"""
    students = Student.query.all()
    return jsonify([{
        'id': s.id,
        'student_id': s.student_id,
        'name': s.name,
        'email': s.email,
        'department': s.department,
        'photo_path': s.photo_path,
        'created_at': s.created_at.isoformat()
    } for s in students])

@app.route('/api/students', methods=['POST'])
def add_student():
    """Add a new student with face encoding"""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['student_id', 'name', 'email', 'department', 'photo']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if student already exists
        existing_student = Student.query.filter_by(student_id=data['student_id']).first()
        if existing_student:
            return jsonify({'error': 'Student ID already exists'}), 400
        
        # Process face image
        face_encoding, error = encode_face_from_base64(data['photo'])
        if error:
            return jsonify({'error': error}), 400
        
        # Create new student
        student = Student(
            student_id=data['student_id'],
            name=data['name'],
            email=data['email'],
            department=data['department'],
            face_encoding=json.dumps(face_encoding.tolist())  # Store as JSON
        )
        
        db.session.add(student)
        db.session.commit()
        
        return jsonify({
            'message': 'Student added successfully',
            'student_id': student.student_id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to add student: {str(e)}'}), 500

@app.route('/api/recognize', methods=['POST'])
def recognize_face():
    """Recognize face and mark attendance"""
    try:
        data = request.json
        
        if 'photo' not in data:
            return jsonify({'error': 'No photo provided'}), 400
        
        # Process the captured image
        unknown_encoding, error = encode_face_from_base64(data['photo'])
        if error:
            return jsonify({'error': error}), 400
        
        # Get all students with face encodings
        students = Student.query.filter(Student.face_encoding.isnot(None)).all()
        
        if not students:
            return jsonify({'error': 'No students registered in the system'}), 400
        
        # Compare with known faces
        known_encodings = []
        known_student_ids = []
        
        for student in students:
            try:
                encoding = json.loads(student.face_encoding)
                known_encodings.append(np.array(encoding))
                known_student_ids.append(student.student_id)
            except:
                continue
        
        if not known_encodings:
            return jsonify({'error': 'No valid face encodings found'}), 400
        
        # Find matches
        matches = face_recognition.compare_faces(known_encodings, unknown_encoding, tolerance=0.6)
        face_distances = face_recognition.face_distance(known_encodings, unknown_encoding)
        
        if True in matches:
            # Find the best match
            best_match_index = np.argmin(face_distances)
            if matches[best_match_index]:
                matched_student_id = known_student_ids[best_match_index]
                matched_student = Student.query.filter_by(student_id=matched_student_id).first()
                
                # Check if already marked attendance today
                today = date.today()
                existing_attendance = Attendance.query.filter_by(
                    student_id=matched_student_id,
                    date=today
                ).first()
                
                if existing_attendance:
                    return jsonify({
                        'message': 'Attendance already marked for today',
                        'student': {
                            'student_id': matched_student.student_id,
                            'name': matched_student.name,
                            'department': matched_student.department
                        },
                        'attendance_time': existing_attendance.time_in.strftime('%H:%M:%S'),
                        'already_marked': True
                    })
                
                # Mark attendance
                attendance = Attendance(
                    student_id=matched_student_id,
                    date=today,
                    time_in=datetime.now().time(),
                    status='Present'
                )
                
                db.session.add(attendance)
                db.session.commit()
                
                return jsonify({
                    'message': 'Attendance marked successfully',
                    'student': {
                        'student_id': matched_student.student_id,
                        'name': matched_student.name,
                        'department': matched_student.department
                    },
                    'attendance_time': attendance.time_in.strftime('%H:%M:%S'),
                    'already_marked': False
                })
        
        return jsonify({'error': 'Face not recognized'}), 404
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Recognition failed: {str(e)}'}), 500

@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    """Get attendance records"""
    date_param = request.args.get('date')
    
    if date_param:
        try:
            filter_date = datetime.strptime(date_param, '%Y-%m-%d').date()
        except:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    else:
        filter_date = date.today()
    
    attendance_records = db.session.query(Attendance, Student).join(
        Student, Attendance.student_id == Student.student_id
    ).filter(Attendance.date == filter_date).all()
    
    records = []
    for attendance, student in attendance_records:
        records.append({
            'id': attendance.id,
            'student_id': student.student_id,
            'student_name': student.name,
            'department': student.department,
            'date': attendance.date.isoformat(),
            'time_in': attendance.time_in.strftime('%H:%M:%S'),
            'status': attendance.status
        })
    
    return jsonify({
        'date': filter_date.isoformat(),
        'total_present': len(records),
        'records': records
    })

@app.route('/api/attendance/summary', methods=['GET'])
def attendance_summary():
    """Get attendance summary statistics"""
    total_students = Student.query.count()
    today = date.today()
    present_today = Attendance.query.filter_by(date=today).count()
    
    return jsonify({
        'total_students': total_students,
        'present_today': present_today,
        'absent_today': total_students - present_today,
        'attendance_rate': round((present_today / total_students * 100) if total_students > 0 else 0, 2)
    })

@app.route('/api/student/<student_id>', methods=['DELETE'])
def delete_student(student_id):
    """Delete a student"""
    student = Student.query.filter_by(student_id=student_id).first()
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    
    # Delete related attendance records
    Attendance.query.filter_by(student_id=student_id).delete()
    
    # Delete student
    db.session.delete(student)
    db.session.commit()
    
    return jsonify({'message': 'Student deleted successfully'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)