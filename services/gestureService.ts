import { FilesetResolver, HandLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";

let handLandmarker: HandLandmarker | undefined = undefined;
let runningMode: "IMAGE" | "VIDEO" = "VIDEO";

export const initializeHandLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
      delegate: "GPU"
    },
    runningMode: runningMode,
    numHands: 1
  });
  
  return handLandmarker;
};

export const detectHands = (video: HTMLVideoElement, timestamp: number) => {
  if (!handLandmarker) return null;
  const result = handLandmarker.detectForVideo(video, timestamp);
  return result;
};

export const calculateGesture = (landmarks: any[]) => {
  if (!landmarks || landmarks.length === 0) return null;

  const hand = landmarks[0]; // Assuming 1 hand
  const wrist = hand[0];

  // Helper to calculate distance
  const dist = (p1: any, p2: any) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

  // FIST DETECTION LOGIC
  // Check if fingertips (8, 12, 16, 20) are closer to wrist (0) than their MCP joints (5, 9, 13, 17)
  // This indicates fingers are curled in.
  let curledFingers = 0;
  
  // Index
  if (dist(hand[8], wrist) < dist(hand[5], wrist)) curledFingers++;
  // Middle
  if (dist(hand[12], wrist) < dist(hand[9], wrist)) curledFingers++;
  // Ring
  if (dist(hand[16], wrist) < dist(hand[13], wrist)) curledFingers++;
  // Pinky
  if (dist(hand[20], wrist) < dist(hand[17], wrist)) curledFingers++;

  // Thumb is tricky, we'll ignore it for a basic fist, or check if it's close to index MCP
  const isFist = curledFingers >= 3; // Strict fist: at least 3 non-thumb fingers curled
  
  // OPEN HAND LOGIC
  // If fingers are extended. Distance from tip to wrist is large.
  // Simple inverse: if not fist, check if fingers are far.
  // Let's rely on !isFist for now, but to avoid jitter, we can add a check.
  const isOpen = curledFingers <= 1;

  return {
    isFist,
    isOpen,
    x: hand[9].x, // Middle finger MCP as center
    y: hand[9].y
  };
};