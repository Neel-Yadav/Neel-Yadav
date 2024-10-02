// Importing Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDq2hxEqaFZfGb0v6Jx2q7i1wPADB4oj5c",
  authDomain: "webapp-872b6.firebaseapp.com",
  projectId: "webapp-872b6",
  storageBucket: "webapp-872b6.appspot.com",
  messagingSenderId: "57103466312",
  appId: "1:57103466312:web:93f0dbe4dd6cd8d3da7d7d"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
auth.languageCode = 'it';

// Google login function
async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    storeUserInLocalStorage(user); // Store user in local storage
    displayUserDetails(user);
  } catch (error) {
    console.error("Error during login:", error.message);
    alert("Login failed. Please try again.");
  }
}

// Function to store user data in Firestore
async function storeUserData(user) {
  try {
    await setDoc(doc(db, "users", user.uid), {
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      lastLogin: new Date().toISOString()
    });
    console.log("User data stored in Firestore.");
  } catch (error) {
    console.error("Error storing user data:", error);
  }
}

// Function to store user in local storage
function storeUserInLocalStorage(user) {
  localStorage.setItem("user", JSON.stringify({
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL
  }));
}

// Function to get user from local storage
function getUserFromLocalStorage() {
  const userString = localStorage.getItem("user");
  return userString ? JSON.parse(userString) : null;
}

// Function to display user details
async function displayUserDetails(user) {
  const docRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const userData = docSnap.data();
    document.getElementById("user-name").textContent = userData.name;
    document.getElementById("user-email").textContent = userData.email;
    document.getElementById("user-photo").src = userData.photoURL;

    // Show user details and hide login button
    document.getElementById("user-details").style.display = "block";
    document.getElementById("login-btn").style.display = "none";
    document.getElementById("logout-btn").style.display = "inline";
  } else {
    console.log("No such document! Storing new user data.");
    await storeUserData(user);
    displayUserDetails(user);
  }
}

// Logout function
async function logout() {
  try {
    await signOut(auth);
    console.log("User signed out.");
    localStorage.removeItem("user"); // Remove user from local storage
    // Hide user details and show login button
    document.getElementById("user-details").style.display = "none";
    document.getElementById("login-btn").style.display = "inline";
    document.getElementById("logout-btn").style.display = "none";
  } catch (error) {
    console.error("Error during logout:", error);
    alert("Logout failed. Please try again.");
  }
}

// Listen for auth state changes to handle user login and logout
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    displayUserDetails(user);
  } else {
    // Check if user data is stored in local storage
    const localUser = getUserFromLocalStorage();
    if (localUser) {
      // If user is in local storage, manually set the UI
      document.getElementById("user-name").textContent = localUser.displayName;
      document.getElementById("user-email").textContent = localUser.email;
      document.getElementById("user-photo").src = localUser.photoURL;

      // Show user details and hide login button
      document.getElementById("user-details").style.display = "block";
      document.getElementById("login-btn").style.display = "none";
      document.getElementById("logout-btn").style.display = "inline";
    } else {
      console.log("No user is signed in.");
      document.getElementById("user-details").style.display = "none";
      document.getElementById("login-btn").style.display = "inline";
      document.getElementById("logout-btn").style.display = "none";
    }
  }
});

// Event listeners
document.getElementById("login-btn").addEventListener("click", loginWithGoogle);
document.getElementById("logout-btn").addEventListener("click", logout);