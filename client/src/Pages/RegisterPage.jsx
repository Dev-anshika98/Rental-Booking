import  { useState, useRef } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Spinner from "../Components/Spinner";


const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const confirmPasswordRef = useRef();
  const navigate = useNavigate();

  function handleRedirect(fallbackUrl) {
    const redirectUrl = sessionStorage.getItem("redirectUrl");
    if (redirectUrl) {
      sessionStorage.removeItem("redirectUrl");
      navigate(redirectUrl);
    } else {
      navigate(fallbackUrl);
    }
  }

  const registerUser = async (ev) => {
    ev.preventDefault();
    try {
      if (password != confirmPassword) {
        toast.error("Password didn't mactch");
        confirmPasswordRef.current.focus();
        return;
      }
      setLoading(true);
      console.log('Sending registration request...');
      const checkEmail = email.toLowerCase();
      const { data,status } = await axios.post('http://localhost:5001/user/register', {
        name,
        email: checkEmail,
        password,
      });
      
      console.log('Registration response:', data,status);

      if (data.message === "Registration successful") {
        toast.success('Registration successful!');
        handleRedirect("/login");
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (e) {
      console.error('Registration Error:', {
        message: e.message,
        response: e.response?.data,
        status: e.response?.status
      });
      
      const errorMessage = e.response?.data?.message 
        || e.message 
        || 'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-4 grow flex-col items-center">
      {loading ? (
        <Spinner />
      ) : (
        <>
          <h1 className="text-3xl text-center mb-4 font-bold">Register</h1>
          <form className="flex flex-col items-center justify-center" onSubmit={registerUser}>
            <input
              type="text"
              placeholder="John Doe"
              className="w-[90%] border py-2 px-3 my-2 rounded-2xl border-gray-300 xs:w-[400px]"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="your@email.com"
              className="w-[90%] border py-2 px-3 my-2 rounded-2xl border-gray-300 xs:w-[400px]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="password"
              className="w-[90%] border py-2 px-3 my-2 rounded-2xl border-gray-300 xs:w-[400px]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input type="password"
              placeholder="confirm password"
              className={`w-[90%] border py-2 px-3 my-2 rounded-2xl border-gray-300 xs:w-[400px] ${password.length === 0 && "cursor-not-allowed"}`}
              value={confirmPassword}
              disabled={password.length === 0}
              onChange={(e) => setConfirmPassword(e.target.value)}
              ref={confirmPasswordRef}
              required
            />
            <button className="bg-pink p-2 text-white rounded-2xl mt-1 hover:scale-95 transition-all w-[90%] xs:max-w-[400px] font-semibold">
              Register
            </button>
            <div className="text-center mt-1">
              Already a member?{" "}
              <Link to={"/login"} className="text-pink underline font-medium">
                login
              </Link>
            </div>
          
          </form>
        </>
      )}
    </div>
  );
};

export default RegisterPage;
