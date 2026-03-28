import React, { useState, useRef, useEffect } from 'react';
import style from './Applayout.module.css';
import Sidebar from '../../Components/sidebar/Sidebar';
import Chatsection from '../../Components/chatsection/Chatsection';
import Rightsection from '../../Components/rightsection/Rightsection';
import Api from '../../api';
import { useDispatch, useSelector } from 'react-redux';
import { updateCollection,updateCurrentCollection } from '../../features/MainSlice';


const Applayout = () => {
  console.log('Refreshed rendering'); 
  const dispatch = useDispatch();
   useEffect( ()=>{
   // Define the async function
    const fetchMetadata = async () => {
        try {
            // Use 'await' to wait for the promise to resolve
            const response = await Api.get('getmetadata');
            console.log(response); // Axios wraps the result in a 'data' object
            if(response){
              console.log(response.data.files);
               let collections= dispatch(updateCollection({collections:response.data.files}))
               dispatch(updateCurrentCollection({currentSelectedcollection:response.data.files[0]}))
            }
        } catch (e) {
            console.log("Error fetching metadata:", e);
        }
    };

    fetchMetadata();
      
   },[])
  const [view, setView] = useState(
    () => {
     const savedUser = localStorage.getItem('isLoggedIn');
      return savedUser === 'true' ? 'authenticated' : 'login';
    }
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Refs to prevent re-renders
  const nameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();

  const handleRegister = async (e) => {
    e.preventDefault();
    const data = {
      name: nameRef.current.value,
      email: emailRef.current.value,
      password: passwordRef.current.value,
      confirmPassword: confirmPasswordRef.current.value,
    };
   
    if (data.password !== data.confirmPassword) {
      return setError("Passwords don't match! ❌");
    }

    setLoading(true);
    try {
      const response = await Api.post('/register', data);
      console.log(response);
      
      alert("Account created successfully! 🎊");
      setView('login');
    } catch (err) {
      console.log(err);
      
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("Logging in:", emailRef.current.value);
    setLoading(true);
    try {
      const response = await Api.post('/login', {
        email: emailRef.current.value,
        password: passwordRef.current.value,
      });
      console.log(response);
      
      // // Store token if your backend uses JWT
      // if (response.data.token) {
      //   localStorage.setItem('token', response.data.token);
      // }
      localStorage.setItem('isLoggedIn', 'true'); // Save session
      setView('authenticated');
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. 🔑");
    } finally {
      setLoading(false);
    }
  };

  if (view === 'authenticated') {
    return (
      <div className={`${style.container}`}>
        <Sidebar />
        <Chatsection />
        <Rightsection />
      </div>
    );
  }

  return (
    <div className={style.mainWrapper}>
      <div className={style.glassCard}>
        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 animate-pulse">
            {error}
          </div>
        )}

        {view === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-gray-800">Welcome Back</h2>
              <p className="text-gray-500 mt-2">Please enter your details</p>
            </div>

            <div className={style.inputGroup}>
              <label className="text-sm font-semibold text-gray-600 ml-1">Email Address</label>
              <input ref={emailRef} type="email" className={style.customInput} placeholder="name@company.com" required />
            </div>

            <div className={style.inputGroup}>
              <label className="text-sm font-semibold text-gray-600 ml-1">Password</label>
              <input ref={passwordRef} type="password" className={style.customInput} placeholder="••••••••" required />
            </div>

            <button disabled={loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50">
              {loading ? "Processing..." : "Sign In"}
            </button>

            <p className="mt-6 text-center text-gray-600 text-sm">
              Don't have an account? 
              <span onClick={() => {setView('register'); setError('')}} className="text-indigo-600 font-bold cursor-pointer ml-1 hover:underline">Create one</span>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-gray-800">Join Us</h2>
              <p className="text-gray-500 mt-2">Start your journey today</p>
            </div>

            <div className={style.inputGroup}>
              <input ref={nameRef} type="text" className={style.customInput} placeholder="Full Name" required />
            </div>

            <div className={style.inputGroup}>
              <input ref={emailRef} type="email" className={style.customInput} placeholder="Email Address" required />
            </div>

            <div className={style.inputGroup}>
              <input ref={passwordRef} type="password" className={style.customInput} placeholder="Create Password" required />
            </div>

            <div className={style.inputGroup}>
              <input ref={confirmPasswordRef} type="password" className={style.customInput} placeholder="Confirm Password" required />
            </div>

            <button disabled={loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95">
              {loading ? "Creating Account..." : "Register Now"}
            </button>

            <p className="mt-6 text-center text-gray-600 text-sm">
              Already a member? 
              <span onClick={() => {setView('login'); setError('')}} className="text-indigo-600 font-bold cursor-pointer ml-1 hover:underline">Log in</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Applayout;