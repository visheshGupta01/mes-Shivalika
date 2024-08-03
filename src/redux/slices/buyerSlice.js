import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosConfig";

// Async thunk to fetch buyers from the backend
export const fetchBuyers = createAsyncThunk(
  "buyers/fetchBuyers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/buyers/getBuyers");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk to add a new buyer
export const createBuyer = createAsyncThunk(
  "buyers/createBuyer",
  async (name, { rejectWithValue }) => {
    try {
      const response = await api.post("/buyers/addBuyer", { name });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const buyerSlice = createSlice({
  name: "buyers",
  initialState: {
    buyers: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBuyers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBuyers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.buyers = action.payload;
      })
      .addCase(fetchBuyers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createBuyer.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createBuyer.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.buyers.push(action.payload);
      })
      .addCase(createBuyer.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default buyerSlice.reducer;
