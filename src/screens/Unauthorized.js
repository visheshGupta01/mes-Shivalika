// src/components/Unauthorized.js

import React from "react";

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-semibold mb-6">Unauthorized</h2>
        <p className="text-gray-700">
          You do not have permission to access this page.
        </p>
      </div>
    </div>
  );
};

export default Unauthorized;
