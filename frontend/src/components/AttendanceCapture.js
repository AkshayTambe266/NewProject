import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, UserCheck, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';

function AttendanceCapture() {
  const webcamRef = useRef(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState(null);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  const captureAndRecognize = useCallback(async () => {
    if (!webcamRef.current) return;

    setProcessing(true);
    setMessage(null);
    setResult(null);

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      
      const response = await axios.post('/api/recognize', {
        photo: imageSrc
      });

      setResult(response.data);
      setMessage({ 
        type: 'success', 
        text: response.data.already_marked 
          ? 'Attendance already marked for today!' 
          : 'Attendance marked successfully!' 
      });
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Recognition failed';
      setMessage({ type: 'error', text: errorMessage });
      setResult(null);
    } finally {
      setProcessing(false);
    }
  }, [webcamRef]);

  const resetCapture = () => {
    setShowWebcam(false);
    setResult(null);
    setMessage(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
        <p className="text-gray-600 mt-2">Use face recognition to mark student attendance</p>
      </div>

      {message && (
        <div className={`${message.type === 'success' ? 'status-success' : 'status-error'}`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <UserCheck className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera Section */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            Camera
          </h2>

          {!showWebcam ? (
            <div className="text-center py-12">
              <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-6">
                Position yourself in front of the camera and click to start face recognition
              </p>
              <button
                onClick={() => setShowWebcam(true)}
                className="btn-primary"
              >
                <Camera className="h-4 w-4 mr-2" />
                Start Camera
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="webcam-container inline-block mb-4 relative">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="w-full max-w-lg rounded-lg"
                />
                {processing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <div className="text-white text-center">
                      <div className="spinner mx-auto mb-2"></div>
                      <p>Processing...</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-x-3">
                <button
                  onClick={captureAndRecognize}
                  disabled={processing}
                  className="btn-primary"
                >
                  {processing ? (
                    <>
                      <div className="spinner mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Recognize Face
                    </>
                  )}
                </button>
                
                <button
                  onClick={resetCapture}
                  className="btn-secondary"
                >
                  Stop Camera
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Result Section */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <UserCheck className="h-5 w-5 mr-2" />
            Recognition Result
          </h2>

          {!result ? (
            <div className="text-center py-12">
              <UserCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Recognition result will appear here after face detection
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Student Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Student ID:</span>
                    <span className="font-medium">{result.student.student_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{result.student.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Department:</span>
                    <span className="font-medium">{result.student.department}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Attendance Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{result.attendance_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      result.already_marked 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {result.already_marked ? 'Already Marked' : 'Present'}
                    </span>
                  </div>
                </div>
              </div>

              {result.already_marked && (
                <div className="status-warning">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    This student's attendance has already been marked for today.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-start">
            <div className="bg-primary-100 text-primary-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</div>
            <div>
              <p className="font-medium text-gray-900">Position Yourself</p>
              <p>Ensure your face is clearly visible and well-lit</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-primary-100 text-primary-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</div>
            <div>
              <p className="font-medium text-gray-900">Start Camera</p>
              <p>Click "Start Camera" to activate face recognition</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-primary-100 text-primary-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</div>
            <div>
              <p className="font-medium text-gray-900">Mark Attendance</p>
              <p>Click "Recognize Face" to mark your attendance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttendanceCapture;