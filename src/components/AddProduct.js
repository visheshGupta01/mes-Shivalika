//AddProduct.js

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  importProducts,
  addStyleProcesses,
} from "../redux/slices/productSlice";
import LoadingSpinner from "../components/loadingSpinner"; // Import the LoadingSpinner component

const AddProduct = () => {

  const processes = useSelector((state) => state.processes.processes);
  const [newStyles, setNewStyles] = useState([]);
  const [selectedProcesses, setSelectedProcesses] = useState({});
  const [processesSubmitted, setProcessesSubmitted] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false); // Add loading state
  const [addLater, setAddLater] = useState(false); // New state for add later

  const dispatch = useDispatch();


  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmitProcesses = async (isAddLater) => {
    console.log("Setting loading to true"); // Debugging log
    console.log(newStyles);
    console.log("addLater:", addLater);
    setLoading(true); // Set loading to true before starting the process
    let stylesWithProcesses;
    if ( isAddLater) {
      console.log("Running Styles with processes for add later");
      // Push styleName but leave processes array empty
      stylesWithProcesses = newStyles.map((styleName) => ({
        styleName, // Use the styleName from newStyles
        processes: [], // Keep processes array empty
      }));
      console.log("done", stylesWithProcesses);
    } else {
      // If processes are provided, map them as expected
      stylesWithProcesses = Object.keys(selectedProcesses).map((styleName) => ({
        styleName, // Add the styleName
        processes: selectedProcesses[styleName].map((process, index) => ({
          processName: process, // Add process name
          order: index + 1, // Add order
          completed: false, // Default completed state
          entries: [], // Empty array for entries
        })),
      }));
    }
    try {
      console.log("Submitting styles and processes..."); // Debugging log
      console.log(stylesWithProcesses);
      await dispatch(
        addStyleProcesses({ styles: stylesWithProcesses })
      ).unwrap();

      console.log("Process submission completed"); // Debugging log
      setNewStyles([]);
      setSelectedProcesses({});
      setProcessesSubmitted(true);
      setAddLater(false); // Reset addLater after submission
    } catch (error) {
      console.error("Failed to submit processes:", error);
    } finally {
      console.log("Setting loading to false"); // Debugging log
      setLoading(false); // Set loading to false after the process is complete
    }
  };

  const handleCheckboxChange = (styleName, process, checked) => {
    setSelectedProcesses((prev) => {
      const updated = { ...prev };
      const styleProcesses = updated[styleName] || [];

      if (checked) {
        styleProcesses.push(process);
      } else {
        const index = styleProcesses.indexOf(process);
        if (index !== -1) {
          styleProcesses.splice(index, 1);
        }
      }

      updated[styleName] = styleProcesses;
      return updated;
    });
  };

  const handleFileUpload = async () => {
    if (file) {
      setLoading(true); // Set loading to true
      try {
        const response = await dispatch(importProducts(file)).unwrap();
        if (response.styles) {
          setNewStyles(response.styles);
        }
      } catch (error) {
        console.error("Failed to upload file:", error);
        alert("Failed to upload file. Please check the console for details.");
      } finally {
        setLoading(false); // Set loading to false
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      {loading && <LoadingSpinner />} {/* Show LoadingSpinner when loading */}
      <div className="mb-8 mt-3">
        <h2 className="text-2xl font-bold mb-4">Import Excel File</h2>
        <input type="file" onChange={handleFileChange} className="mb-4" />
        <button
          onClick={handleFileUpload}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          Upload Excel
        </button>
        {newStyles.length > 0 && addLater === false && (
          <div>
            <h3 className="text-lg font-bold">
              Enter Processes for New Styles
            </h3>
            {newStyles.map((styleName) => (
              <div key={styleName}>
                <h4 className="text-lg font-semibold">{styleName}</h4>
                {processes.map((process, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`process-${styleName}-${index}`}
                      name={process}
                      checked={
                        selectedProcesses[styleName]?.includes(process) || false
                      }
                      onChange={(e) =>
                        handleCheckboxChange(
                          styleName,
                          process,
                          e.target.checked
                        )
                      }
                      className="mr-2"
                    />
                    <label
                      htmlFor={`process-${styleName}-${index}`}
                      className="flex items-center"
                    >
                      {process}
                      {selectedProcesses[styleName]?.includes(process) && (
                        <span className="ml-2 text-gray-500">
                          Order:{" "}
                          {selectedProcesses[styleName].indexOf(process) + 1}
                        </span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            ))}
            <div className="button-group">
              <button onClick={handleSubmitProcesses}>Submit</button>
              <button
                onClick={() => {
                  setAddLater(true);
                  handleSubmitProcesses(true);
                }} // Set addLater to true
                className="ml-4 bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
              >
                Add Later
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddProduct;
