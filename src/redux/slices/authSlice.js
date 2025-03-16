import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosConfig";

export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }, thunkAPI) => {
    try {
      const response = await api.post("/auth/login", { username, password });
      sessionStorage.setItem("user", JSON.stringify(response.data.user)); // Store user in sessionStorage
      sessionStorage.setItem("token", response.data.token); // Store token in sessionStorage
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }

  }
);

export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  sessionStorage.removeItem("user"); // Remove user from sessionStorage
  sessionStorage.removeItem("token"); // Remove user from sessionStorage
  return true;
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isLoading: false,
    user: JSON.parse(sessionStorage.getItem("user")) || null,
    token: sessionStorage.getItem("token") || null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload?.user || null;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.error = null;
      });
  },
});

export default authSlice.reducer;
