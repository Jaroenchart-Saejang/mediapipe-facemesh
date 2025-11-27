# MediaPipe FaceMesh

A real-time face detection and capture application built with React, MediaPipe, and Vite. This application captures face images from multiple angles (front, right, left) with real-time pose detection and validation.

## Features

- **Real-time Face Detection**: Uses Google's MediaPipe FaceMesh for accurate face landmark detection
- **Multi-angle Face Capture**: Captures faces from three angles - front, right (140°), and left (-140°)
- **Pose Estimation**: Automatically calculates head yaw (rotation) in real-time with smoothing
- **Size Validation**: Ensures face size is within acceptable bounds
- **Visual Feedback**: 
  - Real-time face outline visualization
  - Blur effect outside detected face region
  - Face size indicators
  - Countdown timer for captures
- **Image Processing**: Converts captured faces to Base64 format
- **Backend Integration**: Submits captured face images to a backend API

## Prerequisites

- Node.js 16+ and npm
- Modern web browser with webcam access
- Backend server running at `http://localhost:8000` (configurable via `.env`)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mediapipe-facemesh
```

2. Install dependencies:
```bash
npm install
```

## Development

Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:5173` (Vite default).

## Build

Create a production build:
```bash
npm run build
```

## Project Structure

```
├── src/
│   ├── components/
│   │   └── FaceMeshComponent.jsx   # Main face mesh detection & capture component
│   ├── utils/
│   │   └── geometryHelpers.js      # Face geometry calculations and utilities
│   ├── App.jsx                     # Root application component
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles
├── public/                         # Static assets
├── index.html                      # HTML template
├── package.json                    # Project dependencies
├── vite.config.js                  # Vite configuration
└── README.md                       # This file
```

## Key Technologies

- **React 19**: UI framework
- **MediaPipe**: Face mesh detection (@mediapipe/face_mesh)
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Canvas API**: For rendering face mesh and capturing images

## Usage

1. **Start Application**: Run `npm run dev`
2. **Allow Camera Access**: Grant browser permission to access your webcam
3. **Face Detection**: Position your face in the frame
4. **Capture Sequence**:
   - Face front: Capture forward-facing image
   - Face right: Turn head right and capture
   - Face left: Turn head left and capture
5. **Review**: Review all captured images
6. **Submit**: Submit captured faces to the backend API

## Configuration

### Environment Variables

Create a `.env` file to override the default API endpoint:

```env
VITE_API_BASE=http://your-api-server:8000
```

### Face Detection Thresholds

Modify thresholds in `FaceMeshComponent.jsx`:

- `SIZE_MIN` / `SIZE_MAX`: Face size validation range (0.75 - 1.0)
- `COVER_RATIO`: Minimum face coverage ratio (0.75)
- `RIGHT_YAW_MIN`: Minimum rotation for right angle (140°)
- `LEFT_YAW_MAX`: Maximum rotation for left angle (-140°)

## API Integration

The application sends captured face images to:

```
POST {API_BASE}/api/submit-faces
```

Payload format: JSON with Base64-encoded face images

## Linting

Check code quality:
```bash
npm run lint
```

## Data Files

- `face_capture.json`: Sample face capture data
- `face_capture (2).json`: Additional sample data
- `Base64-Decode.ipynb`: Jupyter notebook for decoding Base64 face images

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14.1+
- Requires HTTPS or localhost for camera access

## License

Please refer to your project's license file.

## Support

For issues or questions, please open an issue in the repository.