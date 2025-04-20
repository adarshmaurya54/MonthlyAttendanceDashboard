import { createSlice } from "@reduxjs/toolkit";
import { userLogin, getCurrentUser, userRegister } from "./authAction";

// checking if already token
const token = localStorage.getItem("token")
  ? localStorage.getItem("token")
  : null;
  

const initialState = {
  loading: false,
  user: null,
  token,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
    setUser: (state, action) => {
      state.user = action.payload
    },
  },
  extraReducers: (builder) => {
    //login user----------------------------------------------
    // if the login action in pending
    builder.addCase(userLogin.pending, (state) => {
      (state.loading = true), (state.error = null);
    });

    // if the login action is successful
    builder.addCase(userLogin.fulfilled, (state, { payload }) => {
      (state.loading = false),
        (state.user = payload.user),
        (state.token = payload.token);
    });

    // if the login action is failed or rejected
    builder.addCase(userLogin.rejected, (state, { payload }) => {
      (state.loading = false), (state.error = payload);
    });

    //register----------------------------------------------

    // if the register action in pending
    builder.addCase(userRegister.pending, (state) => {
      (state.loading = true), (state.error = null);
    });

    // if the login action is successful
    builder.addCase(userRegister.fulfilled, (state, { payload }) => {
      (state.loading = false), (state.user = payload.user);
    });

    // if the login action is failed or rejected
    builder.addCase(userRegister.rejected, (state, { payload }) => {
      (state.loading = false), (state.error = payload);
    });

    //current user----------------------------------------------
    builder.addCase(getCurrentUser.pending, (state) => {
      (state.loading = true), (state.error = null);
    });

    builder.addCase(getCurrentUser.fulfilled, (state, { payload }) => {
      (state.loading = false), (state.user = payload.user);
    });

    builder.addCase(getCurrentUser.rejected, (state, { payload }) => {
      (state.loading = false), (state.error = payload);
    });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice;
