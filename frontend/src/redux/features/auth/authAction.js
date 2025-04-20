import { createAsyncThunk } from "@reduxjs/toolkit"; //used to perform asynchronous tasks in a slice
import {API} from "../../../services/apiService"
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

//login
// login
export const userLogin = createAsyncThunk(
  "auth/login",
  async ({ email, password, loginType }, { rejectWithValue }) => {
    const toastId = toast.loading("Please wait..."); 
    try {
      const { data } = await API.post("/auth/login", { email, password, loginType });

      // storing the token that generated when we request to login api
      if (data.success) {
        localStorage.setItem("token", data.token); // data.token, we getting this from the authController.js file from the loginController.
        toast.success(data.message, {id: toastId});
      } else {
        toast.error(data.message, {id: toastId});
        return rejectWithValue(data.message); // Ensure rejection for unsuccessful response
      }
      return data;
    } catch (error) {
      
      // Handle server error (like 500 status)
      if (error.response) {
        toast.error(error.response.data.error, {id: toastId}); 
        return rejectWithValue(error.response.data.error);
      } else {
        toast.error("Something went wrong. Please try again later.", {id: toastId});
        return rejectWithValue(error.message);
      }
    }
  }
);

//register
export const userRegister = createAsyncThunk(
  "auth/register",
  async (
    {
      name,
      role,
      email,
      password,
      organisationName,
      address,
      phone,
      hospitalName,
      website,
    },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await API.post("/auth/register", {
        name,
        role,
        email,
        password,
        organisationName,
        address,
        phone,
        hospitalName,
        website,
      });
      if (data.success) {
        toast.success(data.message);
        window.location.replace("/login");
      }
      return data;
    } catch (error) {
      if (error.response) {
        if (error.response.status === 500) {
          toast.error(error.response.data.message); // 500 error toast
        }
        return rejectWithValue(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again later.");
        return rejectWithValue(error.message);
      }
    }
  } 
);

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/auth/current-user");
      if (res?.data) {
        return res.data; // Return only user data
      } else {
        return rejectWithValue("Failed to fetch user data");
      }
    } catch (error) {
      if (error.response) {
        return rejectWithValue(error.response.data.error || "Server error");
      } else {
        return rejectWithValue("Something went wrong. Please try again.");
      }
    }
  }
);

