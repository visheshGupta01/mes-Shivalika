import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosConfig";

export const fetchProductions = createAsyncThunk(
  "productions/fetchProductions",
  async () => {
    const response = await api.get("/stylesAndProductions/productions");
    return response.data;
  }
);

export const submitProduction = createAsyncThunk(
  "productions/submitProduction",
  async (productionData) => {
    console.log(productionData);
    const response = await api.post(
      "/stylesAndProductions/submitProduction",
      {
        productionData,
      }
    );
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
      })
      .addCase(submitProduction.pending, (state) => {
        // state.loading = true;
        state.error = null;
      })
      .addCase(submitProduction.fulfilled, (state, action) => {
        state.loading = false;
        console.log("Action Payload:", action.payload);

        // Extract the submitted production data from the action payload
        const { processName, size, productionPerDayPerMachine } =
          action.payload;

        // Find the production by processName
        state.productions = state.productions.map((production) => {
          if (production.processName === processName) {
            return {
              ...production,
              sizes: production.sizes.map((s) =>
                s.size === size
                  ? { ...s, productionPerDayPerMachine } // Update the specific size with new productionPerDayPerMachine
                  : s
              ),
            };
          }
          return production;
        });
        console.log(state.productions);
      })

      .addCase(submitProduction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default productionsSlice.reducer;
