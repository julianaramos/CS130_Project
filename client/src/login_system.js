//import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";;
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword,signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";;
//Firebase config 
const firebaseConfig = {
  apiKey: "AIzaSyB3boZBkBB2Dm2mH8G5ZWmdJiqrwOdq6zI",
  authDomain: "cs-130-project-4a50e.firebaseapp.com",
  projectId: "cs-130-project-4a50e",
  storageBucket: "cs-130-project-4a50e.appspot.com",
  messagingSenderId: "778681514699",
  appId: "1:778681514699:web:41ee99f72d206c8524394e",
  measurementId: "G-QN029G6K4X"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getFirestore(app);


//an event that create user with email and password
let RegisterUser = evt =>{
  evt.preventDefault();
  let email = document.getElementById('email').value;
  let password = document.getElementById('password').value;
  console.log(email)
  createUserWithEmailAndPassword(auth,email,password)
  .then((credentials)=>{
    console.log(credentials);
  })
  .catch((error)=>{
    alert(error.message);
    console.log(error.code);
    console.log(error.message);
  })

}
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', RegisterUser);
}

//an event that log in user with eamil and password 
let SignInUser = evt =>{
  evt.preventDefault();
  let email = document.getElementById('email').value;
  let password = document.getElementById('password').value;
  signInWithEmailAndPassword(auth,email,password)
  .then((credentials)=>{

  })
  .catch((error)=>{
    alert(error.message);
    console.log(error.code);
    console.log(error.message);
  })

}
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', SignInUser);
}

//log out 
let SignOut = evt =>{
  evt.preventDefault();
  signOut(auth).then(
    () =>{
      console.log('user signed out');
    }
  )
}
const signOutBtn = document.getElementById("log-out");
if(signOutBtn){
  signOutBtn.addEventListener('click',SignOut);
}


// listen for auth status changes
onAuthStateChanged(auth, user=>{
  if(user){
    console.log('user logged in', user);
  }else{
    console.log('user logged out');
  }
});
function validate_email(email){
  const expression = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
  if (expression.test(email)==true) {
    return true
  }else{
    return false
  }
}

function validate_password(password){
  if(password.length < 6){
    return false
  }else {
    return true
  }
}

function validate_username(username){
  if (username == null) {
    return false
  }else {
    return true
  }
}
