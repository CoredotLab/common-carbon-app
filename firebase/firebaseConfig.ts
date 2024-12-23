// firebase/firebaseConfig.ts

// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
// import { getAnalytics, Analytics } from "firebase/analytics"; // 서버 사이드에서는 Analytics를 사용하지 않으므로 주석 처리

// Firebase 설정 정보 (환경 변수에서 가져오기)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env
    .NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID as string, // 필요시 사용
};

// Firebase 앱 초기화 (앱이 이미 초기화된 경우 중복 초기화를 방지)
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Firebase 인증 초기화
const auth: Auth = getAuth(app);

// Google 인증 제공자 설정
const provider: GoogleAuthProvider = new GoogleAuthProvider();

// Analytics는 클라이언트 사이드에서만 초기화
let analytics: any = null;
if (typeof window !== "undefined" && firebaseConfig.measurementId) {
  // Dynamic import를 사용하여 클라이언트 사이드에서만 로드
  import("firebase/analytics")
    .then(({ getAnalytics }) => {
      analytics = getAnalytics(app);
    })
    .catch((error) => {});
}

export { auth, provider, analytics };
