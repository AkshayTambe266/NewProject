from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import cv2
import face_recognition
import numpy as np
import base64
import io
from PIL import Image
import os
from datetime import datetime, date, timedelta
import json
import jwt
from functools import wraps

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///attendance.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['JWT_SECRET_KEY'] = 'jwt-secret-string'

db = SQLAlchemy(app)

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # admin, teacher, student
    full_name = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(50), nullable=True)
    employee_id = db.Column(db.String(20), nullable=True)  # for teachers
    student_id = db.Column(db.String(20), nullable=True)   # for students
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    student_id = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    department = db.Column(db.String(50), nullable=False)
    face_encoding = db.Column(db.Text, nullable=True)
    photo_path = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Teacher(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    employee_id = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    department = db.Column(db.String(50), nullable=False)
    subject = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(20), db.ForeignKey('student.student_id'), nullable=False)
    teacher_id = db.Column(db.String(20), db.ForeignKey('teacher.employee_id'), nullable=True)
    subject = db.Column(db.String(100), nullable=True)
    date = db.Column(db.Date, nullable=False)
    time_in = db.Column(db.Time, nullable=False)
    status = db.Column(db.String(10), default='Present')
    marked_by = db.Column(db.String(50), nullable=True)  # who marked the attendance
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Session(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    token = db.Column(db.String(255), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Initialize database and create admin user
with app.app_context():
    db.create_all()
    
    # Create default admin user if not exists
    admin_user = User.query.filter_by(username='admin').first()
    if not admin_user:
        admin_user = User(
            username='admin',
            email='admin@attendance.system',
            password_hash=generate_password_hash('admin123'),
            role='admin',
            full_name='System Administrator',
            department='IT'
        )
        db.session.add(admin_user)
        db.session.commit()
        print("Default admin user created: username='admin', password='admin123'")

# JWT token decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            
            data = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            
            if not current_user or not current_user.is_active:
                return jsonify({'error': 'Invalid token'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

# Role-based access decorator
def role_required(allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            # Get current user from token_required decorator
            current_user = args[0] if args else None
            
            if not current_user or current_user.role not in allowed_roles:
                return jsonify({'error': 'Insufficient permissions'}), 403
                
            return f(*args, **kwargs)
        return decorated
    return decorator

def encode_face_from_base64(image_data):
    """Convert base64 image to face encoding"""
    try:
        if 'base64,' in image_data:
            image_data = image_data.split('base64,')[1]
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        image_array = np.array(image)
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

# Authentication Routes
@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400
        
        user = User.query.filter_by(username=username).first()
        
        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 401
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Generate JWT token
        token_payload = {
            'user_id': user.id,
            'username': user.username,
            'role': user.role,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }
        
        token = jwt.encode(token_payload, app.config['JWT_SECRET_KEY'], algorithm='HS256')
        
        # Get role-specific data
        role_data = {}
        if user.role == 'student':
            student = Student.query.filter_by(user_id=user.id).first()
            if student:
                role_data = {
                    'student_id': student.student_id,
                    'department': student.department
                }
        elif user.role == 'teacher':
            teacher = Teacher.query.filter_by(user_id=user.id).first()
            if teacher:
                role_data = {
                    'employee_id': teacher.employee_id,
                    'department': teacher.department,
                    'subject': teacher.subject
                }
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'full_name': user.full_name,
                'department': user.department,
                **role_data
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

@app.route('/api/auth/register', methods=['POST'])
def register():
    """User registration endpoint"""
    try:
        data = request.json
        
        required_fields = ['username', 'email', 'password', 'role', 'full_name']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if user already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        # Validate role
        if data['role'] not in ['admin', 'teacher', 'student']:
            return jsonify({'error': 'Invalid role'}), 400
        
        # Create new user
        user = User(
            username=data['username'],
            email=data['email'],
            password_hash=generate_password_hash(data['password']),
            role=data['role'],
            full_name=data['full_name'],
            department=data.get('department'),
            employee_id=data.get('employee_id'),
            student_id=data.get('student_id')
        )
        
        db.session.add(user)
        db.session.commit()
        
        # Create role-specific record
        if data['role'] == 'student' and data.get('student_id'):
            student = Student(
                user_id=user.id,
                student_id=data['student_id'],
                name=data['full_name'],
                email=data['email'],
                department=data.get('department', '')
            )
            db.session.add(student)
        
        elif data['role'] == 'teacher' and data.get('employee_id'):
            teacher = Teacher(
                user_id=user.id,
                employee_id=data['employee_id'],
                name=data['full_name'],
                email=data['email'],
                department=data.get('department', ''),
                subject=data.get('subject')
            )
            db.session.add(teacher)
        
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user_id': user.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@app.route('/api/auth/logout', methods=['POST'])
@token_required
def logout(current_user):
    """User logout endpoint"""
    try:
        # In a more robust system, you might want to blacklist the token
        return jsonify({'message': 'Logged out successfully'}), 200
    except Exception as e:
        return jsonify({'error': f'Logout failed: {str(e)}'}), 500

@app.route('/api/auth/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    """Get current user profile"""
    try:
        profile_data = {
            'id': current_user.id,
            'username': current_user.username,
            'email': current_user.email,
            'role': current_user.role,
            'full_name': current_user.full_name,
            'department': current_user.department,
            'last_login': current_user.last_login.isoformat() if current_user.last_login else None,
            'created_at': current_user.created_at.isoformat()
        }
        
        # Add role-specific data
        if current_user.role == 'student':
            student = Student.query.filter_by(user_id=current_user.id).first()
            if student:
                profile_data.update({
                    'student_id': student.student_id,
                    'face_enrolled': student.face_encoding is not None
                })
        
        elif current_user.role == 'teacher':
            teacher = Teacher.query.filter_by(user_id=current_user.id).first()
            if teacher:
                profile_data.update({
                    'employee_id': teacher.employee_id,
                    'subject': teacher.subject
                })
        
        return jsonify(profile_data), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get profile: {str(e)}'}), 500

# Enhanced existing routes with authentication

@app.route('/')
def home():
    return jsonify({"message": "Smart Attendance System API", "status": "running"})

@app.route('/api/students', methods=['GET'])
@token_required
@role_required(['admin', 'teacher'])
def get_students(current_user):
    """Get all students - Admin and Teacher access"""
    students = Student.query.all()
    return jsonify([{
        'id': s.id,
        'student_id': s.student_id,
        'name': s.name,
        'email': s.email,
        'department': s.department,
        'photo_path': s.photo_path,
        'face_enrolled': s.face_encoding is not None,
        'created_at': s.created_at.isoformat()
    } for s in students])

@app.route('/api/students', methods=['POST'])
@token_required
@role_required(['admin'])
def add_student(current_user):
    """Add a new student with face encoding - Admin only"""
    try:
        data = request.json
        
        required_fields = ['student_id', 'name', 'email', 'department', 'photo']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        existing_student = Student.query.filter_by(student_id=data['student_id']).first()
        if existing_student:
            return jsonify({'error': 'Student ID already exists'}), 400
        
        face_encoding, error = encode_face_from_base64(data['photo'])
        if error:
            return jsonify({'error': error}), 400
        
        student = Student(
            student_id=data['student_id'],
            name=data['name'],
            email=data['email'],
            department=data['department'],
            face_encoding=json.dumps(face_encoding.tolist())
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
@token_required
def recognize_face(current_user):
    """Recognize face and mark attendance"""
    try:
        data = request.json
        
        if 'photo' not in data:
            return jsonify({'error': 'No photo provided'}), 400
        
        unknown_encoding, error = encode_face_from_base64(data['photo'])
        if error:
            return jsonify({'error': error}), 400
        
        students = Student.query.filter(Student.face_encoding.isnot(None)).all()
        
        if not students:
            return jsonify({'error': 'No students registered in the system'}), 400
        
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
        
        matches = face_recognition.compare_faces(known_encodings, unknown_encoding, tolerance=0.6)
        face_distances = face_recognition.face_distance(known_encodings, unknown_encoding)
        
        if True in matches:
            best_match_index = np.argmin(face_distances)
            if matches[best_match_index]:
                matched_student_id = known_student_ids[best_match_index]
                matched_student = Student.query.filter_by(student_id=matched_student_id).first()
                
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
                
                # Get teacher info if current user is teacher
                teacher_id = None
                subject = None
                if current_user.role == 'teacher':
                    teacher = Teacher.query.filter_by(user_id=current_user.id).first()
                    if teacher:
                        teacher_id = teacher.employee_id
                        subject = teacher.subject
                
                attendance = Attendance(
                    student_id=matched_student_id,
                    teacher_id=teacher_id,
                    subject=subject,
                    date=today,
                    time_in=datetime.now().time(),
                    status='Present',
                    marked_by=current_user.full_name
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
                    'marked_by': current_user.full_name,
                    'subject': subject,
                    'already_marked': False
                })
        
        return jsonify({'error': 'Face not recognized'}), 404
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Recognition failed: {str(e)}'}), 500

@app.route('/api/attendance', methods=['GET'])
@token_required
def get_attendance(current_user):
    """Get attendance records based on user role"""
    date_param = request.args.get('date')
    
    if date_param:
        try:
            filter_date = datetime.strptime(date_param, '%Y-%m-%d').date()
        except:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    else:
        filter_date = date.today()
    
    query = db.session.query(Attendance, Student).join(
        Student, Attendance.student_id == Student.student_id
    ).filter(Attendance.date == filter_date)
    
    # Filter based on user role
    if current_user.role == 'student':
        student = Student.query.filter_by(user_id=current_user.id).first()
        if student:
            query = query.filter(Attendance.student_id == student.student_id)
        else:
            return jsonify({'error': 'Student record not found'}), 404
    
    elif current_user.role == 'teacher':
        teacher = Teacher.query.filter_by(user_id=current_user.id).first()
        if teacher:
            query = query.filter(Attendance.teacher_id == teacher.employee_id)
    
    attendance_records = query.all()
    
    records = []
    for attendance, student in attendance_records:
        records.append({
            'id': attendance.id,
            'student_id': student.student_id,
            'student_name': student.name,
            'department': student.department,
            'date': attendance.date.isoformat(),
            'time_in': attendance.time_in.strftime('%H:%M:%S'),
            'status': attendance.status,
            'subject': attendance.subject,
            'marked_by': attendance.marked_by
        })
    
    return jsonify({
        'date': filter_date.isoformat(),
        'total_present': len(records),
        'records': records
    })

@app.route('/api/attendance/summary', methods=['GET'])
@token_required
def attendance_summary(current_user):
    """Get attendance summary statistics based on user role"""
    today = date.today()
    
    if current_user.role == 'student':
        student = Student.query.filter_by(user_id=current_user.id).first()
        if not student:
            return jsonify({'error': 'Student record not found'}), 404
        
        total_days = Attendance.query.filter_by(student_id=student.student_id).count()
        present_today = Attendance.query.filter_by(
            student_id=student.student_id, 
            date=today
        ).count()
        
        return jsonify({
            'total_attendance_days': total_days,
            'present_today': present_today,
            'student_name': student.name,
            'department': student.department
        })
    
    elif current_user.role == 'teacher':
        teacher = Teacher.query.filter_by(user_id=current_user.id).first()
        if not teacher:
            return jsonify({'error': 'Teacher record not found'}), 404
        
        total_students = Student.query.filter_by(department=teacher.department).count()
        present_today = Attendance.query.filter_by(
            teacher_id=teacher.employee_id,
            date=today
        ).count()
        
        return jsonify({
            'total_students': total_students,
            'present_today': present_today,
            'absent_today': total_students - present_today,
            'attendance_rate': round((present_today / total_students * 100) if total_students > 0 else 0, 2),
            'teacher_name': teacher.name,
            'department': teacher.department,
            'subject': teacher.subject
        })
    
    else:  # admin
        total_students = Student.query.count()
        present_today = Attendance.query.filter_by(date=today).count()
        
        return jsonify({
            'total_students': total_students,
            'present_today': present_today,
            'absent_today': total_students - present_today,
            'attendance_rate': round((present_today / total_students * 100) if total_students > 0 else 0, 2)
        })

@app.route('/api/users', methods=['GET'])
@token_required
@role_required(['admin'])
def get_users(current_user):
    """Get all users - Admin only"""
    users = User.query.all()
    return jsonify([{
        'id': u.id,
        'username': u.username,
        'email': u.email,
        'role': u.role,
        'full_name': u.full_name,
        'department': u.department,
        'is_active': u.is_active,
        'last_login': u.last_login.isoformat() if u.last_login else None,
        'created_at': u.created_at.isoformat()
    } for u in users])

@app.route('/api/student/<student_id>', methods=['DELETE'])
@token_required
@role_required(['admin'])
def delete_student(current_user, student_id):
    """Delete a student - Admin only"""
    student = Student.query.filter_by(student_id=student_id).first()
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    
    Attendance.query.filter_by(student_id=student_id).delete()
    
    if student.user_id:
        User.query.filter_by(id=student.user_id).delete()
    
    db.session.delete(student)
    db.session.commit()
    
    return jsonify({'message': 'Student deleted successfully'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)