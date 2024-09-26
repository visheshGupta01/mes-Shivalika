// src/redux/store.js

import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import userSlice from "./slices/userSlice";
import productSlice from "./slices/productSlice";
import processesSlice from "./slices/processesSlice";
import buyerSlice from "./slices/buyerSlice";
import orderSlice from "./slices/orderSlice";
import productionSlice from "./slices/productionSlice";
import machinesCapacitySlice from "./slices/machinesCapacitySlice";
import styleSlice from "./slices/styleSlice";
import productionsSlice from "./slices/productionsSlice";

const store = configureStore({
  reducer: {
    auth: authSlice,
    user: userSlice,
    products: productSlice,
    processes: processesSlice,
    buyers: buyerSlice,
    orders: orderSlice,
    production: productionSlice,
    machinesCapacity: machinesCapacitySlice,
    styles: styleSlice,
    productions: productionsSlice,
  },
});

export default store;
