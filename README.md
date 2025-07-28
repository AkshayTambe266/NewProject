# Smart Attendance System with Face Recognition

A modern web application that automatically marks student attendance using facial recognition technology. Built with React frontend, Flask backend, and SQLite database.

![Smart Attendance System](https://via.placeholder.com/800x400/3b82f6/ffffff?text=Smart+Attendance+System)

## Features

### 🎯 Core Features
- **Face Recognition**: Advanced AI-powered facial recognition for accurate student identification
- **Real-time Processing**: Instant attendance marking with lightning-fast face detection
- **Secure & Reliable**: Enterprise-grade security with encrypted face data storage
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS

### 📊 Dashboard & Analytics
- Real-time attendance statistics
- Department-wise attendance analytics
- Interactive charts and visualizations
- Attendance rate tracking and trends

### 👥 Student Management
- Easy student registration with face enrollment
- Comprehensive student database
- Search and filter capabilities
- Department-based organization

### 📈 Attendance Tracking
- Webcam-based face recognition
- Automatic attendance marking
- Duplicate prevention (one attendance per day)
- Historical attendance records

### 📋 Reporting & Export
- Date-based attendance reports
- CSV export functionality
- Department-wise statistics
- Real-time attendance monitoring

## Technology Stack

### Backend
- **Flask**: Python web framework
- **OpenCV**: Computer vision library for image processing
- **face_recognition**: Advanced facial recognition library
- **SQLAlchemy**: Database ORM
- **SQLite**: Lightweight database
- **NumPy**: Numerical computing

### Frontend
- **React**: Modern JavaScript library
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **React Webcam**: Camera integration
- **Lucide React**: Modern icon library

## Installation & Setup

### Prerequisites
- Python 3.7 or higher
- Node.js 14 or higher
- npm or yarn
- Webcam/Camera access

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-attendance-system
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Flask backend**
   ```bash
   cd backend
   python app.py
   ```
   The backend will start on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Install Tailwind CSS**
   ```bash
   npx tailwindcss init -p
   ```

4. **Start the React development server**
   ```bash
   npm start
   ```
   The frontend will start on `http://localhost:3000`

## Usage Guide

### 1. Student Registration
1. Navigate to **Register Student** page
2. Fill in student information (ID, name, email, department)
3. Click **Open Camera** to activate webcam
4. Position face clearly in the camera frame
5. Click **Capture Photo** to take face photo
6. Submit the form to register the student

### 2. Mark Attendance
1. Go to **Mark Attendance** page
2. Click **Start Camera** to activate face recognition
3. Position yourself in front of the camera
4. Click **Recognize Face** to identify and mark attendance
5. System will display recognition result and attendance status

### 3. View Attendance Records
1. Visit **View Records** page
2. Select date to view attendance for specific day
3. Use search and filter options to find specific records
4. Export data to CSV for further analysis

### 4. Manage Students
1. Access **Students** page to view all registered students
2. Search by name, ID, or email
3. Filter by department
4. Delete students if needed (with confirmation)

## API Endpoints

### Student Management
- `GET /api/students` - Get all students
- `POST /api/students` - Register new student
- `DELETE /api/student/<id>` - Delete student

### Attendance
- `POST /api/recognize` - Recognize face and mark attendance
- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/summary` - Get attendance statistics

## Database Schema

### Students Table
- `id`: Primary key
- `student_id`: Unique student identifier
- `name`: Student name
- `email`: Email address
- `department`: Department name
- `face_encoding`: Encoded face data (JSON)
- `created_at`: Registration timestamp

### Attendance Table
- `id`: Primary key
- `student_id`: Foreign key to students
- `date`: Attendance date
- `time_in`: Check-in time
- `status`: Attendance status
- `created_at`: Record timestamp

## Face Recognition Process

1. **Image Capture**: Webcam captures student image
2. **Face Detection**: OpenCV detects faces in the image
3. **Face Encoding**: face_recognition library creates unique face encoding
4. **Comparison**: New encoding compared with stored encodings
5. **Identification**: Best match identified (if above threshold)
6. **Attendance Marking**: Attendance recorded in database

## Security Features

- Face data stored as encrypted encodings (not images)
- Input validation and sanitization
- SQL injection prevention
- CORS protection
- Secure camera access permissions

## Performance Optimization

- Efficient face encoding storage
- Fast comparison algorithms
- Optimized database queries
- Responsive UI with loading states
- Real-time updates

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

**Note**: Camera access required for face recognition functionality.

## Troubleshooting

### Common Issues

1. **Camera not working**
   - Ensure camera permissions are granted
   - Check if camera is being used by another application
   - Try refreshing the page

2. **Face not recognized**
   - Ensure good lighting conditions
   - Position face clearly in camera frame
   - Make sure only one face is visible
   - Re-register if recognition consistently fails

3. **Backend connection error**
   - Verify backend server is running on port 5000
   - Check firewall settings
   - Ensure all dependencies are installed

### Dependencies Issues

If you encounter issues with face_recognition installation:

```bash
# On Ubuntu/Debian
sudo apt-get install cmake libopenblas-dev liblapack-dev

# On macOS
brew install cmake

# On Windows
# Install Visual Studio Build Tools
# Or use conda: conda install -c conda-forge dlib
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenCV team for computer vision tools
- face_recognition library by Adam Geitgey
- React team for the frontend framework
- Tailwind CSS for the styling system

## Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the documentation

---

**Built with ❤️ for educational institutions seeking modern attendance solutions.**