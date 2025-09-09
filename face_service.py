import os
import cv2
import numpy as np
from typing import Optional, Tuple

from database import get_db


class FaceService:
	def __init__(self, model_path: str, dataset_dir: str):
		self.model_path = model_path
		self.dataset_dir = dataset_dir
		self.classifier = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
		self.recognizer = cv2.face.LBPHFaceRecognizer_create(radius=1, neighbors=8, grid_x=8, grid_y=8)
		if os.path.exists(self.model_path):
			self.recognizer.read(self.model_path)

	def _detect_face(self, gray_image: np.ndarray) -> Optional[np.ndarray]:
		faces = self.classifier.detectMultiScale(gray_image, scaleFactor=1.2, minNeighbors=5, minSize=(80, 80))
		if len(faces) == 0:
			return None
		x, y, w, h = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)[0]
		return gray_image[y:y+h, x:x+w]

	def save_sample_and_register(self, name: str, roll_no: str, image_bytes: bytes) -> int:
		np_arr = np.frombuffer(image_bytes, np.uint8)
		bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
		gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
		face = self._detect_face(gray)
		if face is None:
			raise ValueError('No face detected')

		db = get_db()
		cur = db.execute('INSERT INTO students (name, roll_no) VALUES (?, ?)', (name, roll_no))
		student_id = cur.lastrowid
		db.commit()

		img_path = os.path.join(self.dataset_dir, f"{student_id}_1.png")
		cv2.imwrite(img_path, face)
		return student_id

	def train(self) -> None:
		image_paths = [os.path.join(self.dataset_dir, f) for f in os.listdir(self.dataset_dir) if f.endswith('.png')]
		if not image_paths:
			return
		faces = []
		labels = []
		for path in image_paths:
			img = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
			if img is None:
				continue
			label = int(os.path.basename(path).split('_')[0])
			faces.append(cv2.resize(img, (200, 200)))
			labels.append(label)
		if not faces:
			return
		self.recognizer.train(faces, np.array(labels))
		os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
		self.recognizer.write(self.model_path)

	def recognize(self, image_bytes: bytes) -> Tuple[Optional[dict], Optional[float]]:
		np_arr = np.frombuffer(image_bytes, np.uint8)
		bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
		gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
		face = self._detect_face(gray)
		if face is None:
			return None, None
		face_resized = cv2.resize(face, (200, 200))
		try:
			label, confidence = self.recognizer.predict(face_resized)
		except cv2.error:
			return None, None
		# Lower confidence is better in LBPH; set a threshold
		if confidence > 75.0:
			return None, confidence
		db = get_db()
		row = db.execute('SELECT id, name, roll_no FROM students WHERE id = ?', (label,)).fetchone()
		if row is None:
			return None, confidence
		student = {'id': row['id'], 'name': row['name'], 'roll_no': row['roll_no']}
		return student, confidence
