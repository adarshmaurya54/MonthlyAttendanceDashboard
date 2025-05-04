import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bg from "../assets/bg.jpg";
import InputType from "../components/InputType";
import { getCurrentUser, userLogin } from "../redux/features/auth/authAction"
import store from "../redux/store"
import { useDispatch, useSelector } from "react-redux";
import { IoIosMail } from "react-icons/io";
import { IoLockClosedOutline } from "react-icons/io5";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(""); // Error message state
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginType, setLoginType] = useState("teacher")

    const navigate = useNavigate(); // To navigate to another page on success
    const { user, token } = useSelector((state) => state.auth)
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getCurrentUser()); // Dispatch action directly
    }, [dispatch,token]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            store.dispatch(userLogin({ email, password, loginType }))
        } catch (error) {
            console.error(error);
        }
    };

    // Redirect to home page after successful login
    useEffect(() => {
        if (token && user) {
            navigate("/");
        }
    }, [token, user, navigate]);

    return (
        <div
            className="h-screen font-poppins relative  overflow-x-hidden bg-center bg-cover"
            style={{ backgroundImage: `url(${bg})` }}
        >
            <div className="w-full h-full flex backdrop-blur-sm items-center justify-center">
                <div className="w-[330px] bg-gradient-to-t from-white to-blue-50 rounded-3xl p-6 border-4 border-white shadow-lg mx-auto my-5">
                    <div className="text-center font-extrabold text-2xl text-black">
                        Login
                    </div>
                    <div className="rounded-2xl p-3 bg-white mt-3">
                        <div className="relative select-none w-full flex items-center ">
                            <div className={`absolute z-10 top-0 ${loginType === "student" ? "left-[50%]" : "left-[0%]"}  transition-all duration-500 bg-black rounded-xl h-full w-full`}></div>
                            <div onClick={() => setLoginType("teacher")} className={`w-full z-20 text-center cursor-pointer transition-colors duration-500 rounded-xl p-2 ${loginType !== "teacher" ? "text-black" : "text-white"}`}>
                                Teacher
                            </div>
                        </div>
                    </div>
                    {error && (
                        <MessageCard
                            type="error"
                            message="Login failed"
                            subMessage={error}
                            setError={setError}
                            crossbtn={true}
                        />
                    )}
                    {loginLoading && (
                        <MessageCard
                            type="info"
                            message="Please wait for a moment..."
                            subMessage="We are processing your login."
                            setError={setError}
                            crossbtn={false}
                        />
                    )}
                    <form onSubmit={handleLogin}>

                        <InputType icon={<IoIosMail />} extraClass="mt-5" inputType="email" required={true} name="email"
                            placeholder="E-mail" value={email}
                            onChange={(e) => setEmail(e)} />
                        <InputType icon={<IoLockClosedOutline />} extraClass='mt-5' inputType="password" name="password"
                            placeholder="Password" value={password}
                            onChange={(e) => setPassword(e)} />
                        <span className="block pointer-events-none mt-3 mb-1 ml-3 text-xs text-gray-400">
                            <p>Don't have an account? <Link className="text-blue-500 hover:underline" to='/sign-up'>Sign Up</Link></p>
                        </span>
                        <span className="block pointer-events-none ml-3 text-xs text-gray-400">
                            <a href="#">Forgot Password ?</a>
                        </span>
                        <input
                            className="block w-full font-bold bg-black text-white py-3 mt-5 rounded-2xl shadow-lg transform transition-transform hover:scale-105 active:scale-95"
                            type="submit"
                            value="Sign In"
                        />
                    </form>
                    <button
                        className="bg-white border mt-5 text-center  w-full rounded-2xl h-14 relative text-black text-xl font-semibold group"
                        type="button"
                        onClick={() => navigate('/')}
                    >
                        <div className="bg-black text-white rounded-xl h-12 w-1/4 flex items-center justify-center absolute left-1 top-[4px] group-hover:w-[calc(100%-8px)] z-10 duration-500">

                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 1024 1024"
                                height="25px"
                                width="25px"
                            >
                                <path
                                    d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"
                                    fill="#fff"
                                ></path>
                                <path
                                    d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"
                                    fill="#fff"
                                ></path>
                            </svg>
                        </div>
                        <p className="translate-x-2">Go Back</p>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Login;
