import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";

// Your Firebase Config. Users can update these details in their Firebase Console.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Print loaded configuration (excluding sensitive values)
console.warn("Firebase config loaded:", {
  apiKeyExists: !!firebaseConfig.apiKey,
  apiKeyType: typeof firebaseConfig.apiKey,
  apiKeyLength: firebaseConfig.apiKey ? firebaseConfig.apiKey.length : 0,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
  measurementId: firebaseConfig.measurementId
});

// Initialize Firebase with try-catch error handling
let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log("Firebase successfully initialized.");
} catch (error) {
  console.error("Firebase Auth / SDK Initialization Failed: ", error.message, error);
}

const googleProvider = new GoogleAuthProvider();

export { auth, db };

// Helper to check if a username is unique
export async function checkUsernameUnique(username) {
  const cleanUsername = username.trim().toLowerCase();
  if (!cleanUsername) return false;
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("username", "==", cleanUsername));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty;
}

// Helper to check if an email is unique in Firestore users collection
export async function checkEmailUnique(email) {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return false;
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", cleanEmail));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty;
}

// Log in user with Email & Password
export async function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// Register user with Email & Password
export async function registerWithEmail(fullName, username, email, password) {
  // First, double check uniqueness of username and email
  const isUsernameUnique = await checkUsernameUnique(username);
  if (!isUsernameUnique) {
    throw new Error("Username is already taken.");
  }
  
  const isEmailUnique = await checkEmailUnique(email);
  if (!isEmailUnique) {
    throw new Error("Email address is already in use.");
  }

  // Create Firebase auth user
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Create document in Firestore
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    fullName: fullName.trim(),
    username: username.trim().toLowerCase(),
    email: email.trim().toLowerCase(),
    profilePhoto: "",
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
    provider: "email",
    onboardingCompleted: true,
    role: "user"
  });

  return user;
}

// Google Sign-In
export async function signInWithGoogle(email = "") {
  const provider = new GoogleAuthProvider();
  if (email && email.trim()) {
    provider.setCustomParameters({
      login_hint: email.trim()
    });
  }
  const userCredential = await signInWithPopup(auth, provider);
  const user = userCredential.user;

  // Check if document exists in Firestore
  const docRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    // Existing user: update last login timestamp
    await updateDoc(docRef, {
      lastLogin: serverTimestamp()
    });
    return { user, isNewUser: !docSnap.data().onboardingCompleted };
  } else {
    // New Google user: we will redirect to onboarding to set their username
    // We create a temporary profile with onboardingCompleted: false
    await setDoc(docRef, {
      uid: user.uid,
      fullName: user.displayName || "",
      username: "", // To be completed during onboarding
      email: user.email || "",
      profilePhoto: user.photoURL || "",
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      provider: "google",
      onboardingCompleted: false,
      role: "user"
    });
    return { user, isNewUser: true };
  }
}

// Complete profile onboarding for new Google sign-in users
export async function completeOnboarding(uid, username, fullName, avatarUrl) {
  const isUsernameUnique = await checkUsernameUnique(username);
  if (!isUsernameUnique) {
    throw new Error("Username is already taken.");
  }

  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, {
    username: username.trim().toLowerCase(),
    fullName: fullName.trim(),
    profilePhoto: avatarUrl || "",
    onboardingCompleted: true
  });
}

// Log out
export function logoutUser() {
  return signOut(auth);
}

// Forgot Password reset link
export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

// Listen to Auth State changes
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        // Get complete profile info from Firestore
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          callback(user, docSnap.data());
        } else {
          callback(user, null);
        }
      } catch (error) {
        console.error("Error fetching user profile from Firestore:", error);
        // Gracefully fallback to passing user auth but null profile
        callback(user, null);
      }
    } else {
      callback(null, null);
    }
  });
}
