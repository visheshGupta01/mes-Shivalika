import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import CreateUser from "./components/CreateUser";
import Home from "./components/Home"; // example home component
import Unauthorized from "./components/Unauthorized"; // example unauthorized component
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import AddProduct from "./components/AddProduct";


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
            <PrivateRoute allowedUserTypes={["Admin"]}>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-product"
          element={
            <PrivateRoute
              allowedUserTypes={["Admin", "Merchant", "Management","Process Department"]}
            >
              <AddProduct />
            </PrivateRoute>
          }
        />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </>
  );
};

export default App;
