// import React, { useState } from "react";
// import Limage from "../../img/login.png";
// import "./style.scss";
// import { useNavigate, Link } from "react-router-dom";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { auth } from "../../firebase";

// const Login = () => {
//   const [err, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const email = e.target[0].value;
//     const password = e.target[1].value;

//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//       setSuccess('Login successful!');


//       setTimeout(() => {
//         navigate("/menties/profile");
//       }, 3000);
      
//     } catch (err) {
//       console.error(err);
//       setError(err.message); 
//     }
//   };
//   return (
//     <div className="formContainer text-color:black">
//       <div className="imageContainer">
//         <img src={Limage} alt="Error!" />
//       </div>
//       <div className="formWrapper">
//         <span className="logo text-color:rgb(134, 101, 101)">Menties Side</span>
//         <span className="title">Login</span>
//         <form onSubmit={handleSubmit}>
//           <input type="email" placeholder="email" />
//           <input type="password" placeholder="password" />
//           <button>Sign in</button>
//           {err && <div className="error">{err}</div>}
//           {success && <div className="success">{success}</div>}
//         </form>
//         <p>You don't have an account? <Link to="/menties/register">Register</Link></p>
//       </div>
//     </div>
//   );
// };

// export default Login;
import React, { useState } from "react";
import Limage from "../../img/login.png";
import "./style.scss";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";

const Login = () => {
  const [err, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccess('Login successful!');
      setTimeout(() => {
        navigate("/menties/profile");
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.message); 
    }
  };

  return (
    <div className="formContainer mentiee">
      <div className="imageContainer">
        <img src={Limage} alt="Error!" />
      </div>
      <div className="formWrapper">
        <span className="logo">Menties Side</span>
        <span className="title">Login</span>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="email" />
          <input type="password" placeholder="password" />
          <button>Sign in</button>
          {err && <div className="error">{err}</div>}
          {success && <div className="success">{success}</div>}
        </form>
        <p>You don't have an account? <Link to="/menties/register">Register</Link></p>
      </div>
    </div>
  );
};

export default Login;
