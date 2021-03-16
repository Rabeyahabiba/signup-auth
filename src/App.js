import './App.css';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
import { useState } from 'react';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
function App() {
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignedIn: false,

    name: '',
    email: '',
    password: '',
    photo: '',
    error: '',
    success: false
  })
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();
  const handleSignIn = () => {
    firebase.auth().signInWithPopup(googleProvider)
      .then(res => {
        const { displayName, photoURL, email } = res.user;
        const signedInUser = {
          isSignedIn: true,
          name: displayName,
          email: email,
          photo: photoURL
        }
        setUser(signedInUser);
        console.log(displayName, photoURL, email);
      })
      .catch(err => {
        console.log(err);
        console.log(err.message);
      })
  }
 const handleFbSignIn =() =>{
  firebase.auth().signInWithPopup(fbProvider)
  .then((result) => {
    /** @type {firebase.auth.OAuthCredential} */
    var credential = result.credential;

    // The signed-in user info.
    var user = result.user;

    // This gives you a Facebook Access Token. You can use it to access the Facebook API.
    var accessToken = credential.accessToken;

    console.log('fb user after sign in', user);
  })
  .catch((error) => {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
  });
 }
  const handleSignOut = () => {
    firebase.auth().signOut()
      .then(res => {
        const signedOutUser = {
          isSignedIn: false,
          name: '',
          email: '',
          photo: ''
        }
        setUser(signedOutUser);
      })
      .catch(err => {

      });
  }
  const handleBlur = (e) => {
    let isFieldValid = true;
    if (e.target.name === 'email') {
      isFieldValid = /\S+@\S+\.\S+/.test(e.target.value);
    }
    if (e.target.name === 'password') {
      const isPasswordValid = e.target.value.length > 6;
      const passwordHasNumber = /\d{1}/.test(e.target.value);
      isFieldValid = isPasswordValid && passwordHasNumber
    }
    if (isFieldValid) {
      const newUserInfo = { ...user };
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo)
    }
  }
  const handleSubmit = (e) => {
    // console.log(user.email,user.password)
    if (newUser && user.email && user.password) {
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          updateUserName (user.name);
        })
        .catch((error) => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }
    if (!newUser && user.email && user.password) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
           console.log ('sign in user info', res.user);
        })
        .catch((error) => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }
    e.preventDefault();
  }
  const updateUserName = name => {
    const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name
    }).then(function() {
     console.log ('user name update successfully')
    }).catch(function(error) {
      console.log(error)
    });
  }
  return (
    <div className="App">
      {
        user.isSignedIn ? <button onClick={handleSignOut}>Sign out</button> :
          <button onClick={handleSignIn}>Sign in</button>

      }
      <br/>
       <button onClick ={handleFbSignIn}> Sign in Using Facebook</button>
      {
        user.isSignedIn && <div>
          <p> Welcome, {user.name} </p>
          <p> your email: {user.email} </p>
          <img src={user.photo} alt="" />
        </div>
      }

      <h1> Our Own Authentication system</h1>
      <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id="" />
      <label htmlFor="newUser" >New User Sign up </label>
      {/* <p>Name: {user.name}</p>
    <p>Email: {user.email}</p>
    <p>password : {user.password}</p> */}
      <form onSubmit={handleSubmit}>
        {newUser && <input name="name" onBlur={handleBlur} placeholder=" Your Name" required />}
        <br />

        <input type="text" name="email" onBlur={handleBlur} placeholder=" Your Email Address" required />
        <br />
        <input type="password" name="password" onBlur={handleBlur} placeholder=" Your password" required />
        <br />
        <input type="submit" value={newUser ? 'sign up' :'sign in'} />
      </form>
      <p style={{ color: 'red' }}>{user.error}</p>
      {user.success && <p style={{ color: 'green' }}>User {newUser ? 'Created' : 'logged in'} Successfully</p>}
    </div>
  );
}

export default App;
