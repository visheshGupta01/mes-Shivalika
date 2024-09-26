import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosConfig";

export const fetchProductions = createAsyncThunk(
  "productions/fetchProductions",
  async () => {
    const response = await api.get("stylesAndProductions/productions");
    return response.data;
  }
);

const productionsSlice = createSlice({
  name: "productions",
  initialState: {
    productions: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductions.fulfilled, (state, action) => {
        state.loading = false;
        state.productions = action.payload;
      })
      .addCase(fetchProductions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});


export default productionsSlice.reducer;

