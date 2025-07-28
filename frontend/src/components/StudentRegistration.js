import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Save, RotateCcw, User } from 'lucide-react';
import axios from 'axios';

function StudentRegistration() {
  const webcamRef = useRef(null);
  const [formData, setFormData] = useState({
    student_id: '',
    name: '',
    email: '',
    department: ''
  });
  const [capturedImage, setCapturedImage] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Mechanical',
    'Civil',
    'Electrical',
    'Chemical',
    'Biotechnology'
  ];

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setShowWebcam(false);
  }, [webcamRef]);

  const retakePhoto = () => {
    setCapturedImage(null);
    setShowWebcam(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!capturedImage) {
      setMessage({ type: 'error', text: 'Please capture a photo' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const payload = {
        ...formData,
        photo: capturedImage
      };

      const response = await axios.post('/api/students', payload);
      
      setMessage({ type: 'success', text: response.data.message });
      
      // Reset form
      setFormData({
        student_id: '',
        name: '',
        email: '',
        department: ''
      });
      setCapturedImage(null);
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to register student';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Register New Student</h1>
        <p className="text-gray-600 mt-2">Add a new student to the attendance system</p>
      </div>

      {message && (
        <div className={`${message.type === 'success' ? 'status-success' : 'status-error'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Student Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student ID
              </label>
              <input
                type="text"
                name="student_id"
                value={formData.student_id}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter student ID"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter full name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter email address"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Photo Capture */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            Face Photo
          </h2>
          
          {!showWebcam && !capturedImage && (
            <div className="text-center py-8">
              <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Capture a clear photo of the student's face</p>
              <button
                type="button"
                onClick={() => setShowWebcam(true)}
                className="btn-primary"
              >
                <Camera className="h-4 w-4 mr-2" />
                Open Camera
              </button>
            </div>
          )}

          {showWebcam && (
            <div className="text-center">
              <div className="webcam-container inline-block mb-4">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="w-full max-w-md"
                />
              </div>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="btn-primary"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Capture Photo
                </button>
                <button
                  type="button"
                  onClick={() => setShowWebcam(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {capturedImage && (
            <div className="text-center">
              <div className="inline-block mb-4">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-64 h-48 object-cover rounded-lg border-4 border-primary-200"
                />
              </div>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={retakePhoto}
                  className="btn-secondary"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake Photo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="card">
          <button
            type="submit"
            disabled={loading || !capturedImage}
            className="w-full btn-primary flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="spinner mr-2"></div>
                Registering...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Register Student
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default StudentRegistration;