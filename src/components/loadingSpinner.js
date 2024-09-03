import React from "react";

const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50  z-[9999]">
    <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
  </div>
);


export default LoadingSpinner;
