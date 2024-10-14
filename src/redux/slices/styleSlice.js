import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosConfig";

// Fetch existing styles
export const fetchStyles = createAsyncThunk("styles/fetchStyles", async () => {
  const response = await api.get("/stylesAndProductions/styles");
  return response.data;
});

// Submit processes for a specific style and update the products
export const submitProcesses = createAsyncThunk(
  "styles/submitProcesses",
  async ({ styleName, processes }, { rejectWithValue }) => {
    console.log("This calles")
    console.log(processes)
    try {
      const response = await api.post("/stylesAndProductions/submitProcesses", {
        styleName,
        processes,
      });
      return response.data;
    } catch (error) {
      // If the request fails, reject the value to handle in the reducer
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

const stylesSlice = createSlice({
  name: "styles",
  initialState: {
    styles: [],
    loading: false,
    error: null,
    submitLoading: false,
    submitError: null,
    submitSuccess: false,
  },
  reducers: {
    // You can add reducers here if needed, for local state changes
  },
  extraReducers: (builder) => {
    // Handle fetchStyles thunk
    builder
      .addCase(fetchStyles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStyles.fulfilled, (state, action) => {
        state.loading = false;
        state.styles = action.payload;
      })
      .addCase(fetchStyles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Handle submitProcesses thunk
    builder
      .addCase(submitProcesses.pending, (state) => {
        state.submitLoading = true;
        state.submitError = null;
        state.submitSuccess = false;
      })
      .addCase(submitProcesses.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.submitSuccess = true;

        // Assuming the backend returns the updated style
        const updatedStyle = action.payload.existingStyle;
console.log(updatedStyle)
        // Find the index of the style to update
        const index = state.styles.findIndex(
          (style) => style.styleName === updatedStyle.styleName
        );
console.log(index)
        if (index !== -1) {
          state.styles[index] = updatedStyle;
        }
      })
      .addCase(submitProcesses.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload;
        state.submitSuccess = false;
      });
  },
});

export default stylesSlice.reducer;
