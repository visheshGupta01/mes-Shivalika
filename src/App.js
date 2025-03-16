import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./screens/Login";
import CreateUser from "./screens/CreateUser";
import MasterSheet from "./screens/MasterSheet"; // example home component
import Unauthorized from "./screens/Unauthorized"; // example unauthorized component
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import AddProduct from "./screens/AddProduct";
import ProductionData from "./screens/ProductionData";
import StylesProductionsPage from "./screens/stylesAndProductions";

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/create-user"
          element={
            <PrivateRoute allowedUserTypes={["Admin"]}>
              <CreateUser />
            </PrivateRoute>
          }
        />
        <Route
          path="/"
          element={
            <PrivateRoute allowedUserTypes={["Admin","Management"]}>
              <MasterSheet />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-product"
          element={
            <PrivateRoute
              allowedUserTypes={[
                "Admin",
                "Merchant",
                "Management",
                "Process Department",
              ]}
            >
              <AddProduct />
            </PrivateRoute>
          }
        />
        <Route path="/styles-productions" element={
          <StylesProductionsPage />
        } />
        <Route
          path="/production-entry"
          element={
            <PrivateRoute
              allowedUserTypes={["Admin", "Management", "Process Department"]}
            >
              <ProductionData />
            </PrivateRoute>
          }
        />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </>
  );
};

export default App;
