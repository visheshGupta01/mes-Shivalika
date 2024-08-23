//AddProduct.js

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addProduct,
  importProducts,
  addStyleProcesses,
} from "../redux/slices/productSlice";
import { fetchBuyers, createBuyer } from "../redux/slices/buyerSlice";
import { addOrder } from "../redux/slices/orderSlice";
import LoadingSpinner from "../components/loadingSpinner"; // Import the LoadingSpinner component

const AddProduct = () => {
  const [product, setProduct] = useState({
    image: "",
    srNo: "",
    buyer: "",
    buyerPO: "",
    color: "",
    exFactoryDate: "",
    styleName: "",
    size: "",
    quantity: "",
    processes: [],
  });

  const processes = useSelector((state) => state.processes.processes);
  const buyers = useSelector((state) => state.buyers.buyers);
  const [filteredBuyers, setFilteredBuyers] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [newStyles, setNewStyles] = useState([]);

  const [selectedProcesses, setSelectedProcesses] = useState({});
  const [processesSubmitted, setProcessesSubmitted] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false); // Add loading state
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchBuyers());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });

    if (name === "buyer") {
      setInputValue(value);
      setFilteredBuyers(
        buyers.filter((buyer) =>
          buyer.name.toLowerCase().includes(value.toLowerCase())
        )
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let existingBuyer = buyers.find(
      (buyer) => buyer.name.toLowerCase() === inputValue.toLowerCase()
    );

    if (!existingBuyer) {
      try {
        const newBuyer = await dispatch(createBuyer(inputValue)).unwrap();
        existingBuyer = newBuyer;
      } catch (error) {
        console.error("Failed to create buyer:", error);
        return;
      }
    }

    if (!processesSubmitted) {
      alert("Please submit processes before adding the product.");
      return;
    }

    setLoading(true); // Set loading to true
    const processesWithOrder =
      selectedProcesses[product.styleName]?.map((process, index) => ({
        processName: process,
        entries: [],
        order: index + 1,
        completed: false,
      })) || [];

    const updatedProduct = {
      ...product,
      buyer: existingBuyer.name,
      processes: processesWithOrder,
    };

    try {
      const addedProduct = await dispatch(addProduct(updatedProduct)).unwrap();

      const orderData = {
        srNo: product.srNo,
        buyer: existingBuyer.name,
        products: [
          {
            productId: addedProduct._id,
            quantity: product.quantity,
            status: "Pending",
          },
        ],
      };

      await dispatch(addOrder(orderData));
    } catch (error) {
      console.error("Failed to add product:", error);
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };  

const handleSubmitProcesses = async () => {
  console.log("Setting loading to true"); // Debugging log
  setLoading(true); // Set loading to true before starting the process
  

  const stylesWithProcesses = Object.keys(selectedProcesses).map(
    (styleName) => ({
      styleName,
      processes: selectedProcesses[styleName].map((process, index) => ({
        processName: process,
        order: index + 1, // Order in the list
        completed: false, // Initial completion status
        entries: [], // Empty array for entries
      })),
    })
  );

  try {
    console.log("Submitting styles and processes..."); // Debugging log
    await dispatch(addStyleProcesses({ styles: stylesWithProcesses })).unwrap();

    console.log("Process submission completed"); // Debugging log
    setNewStyles([]);
    setSelectedProcesses({});
    setProcessesSubmitted(true);
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

  const handleSelectBuyer = (buyer) => {
    setProduct({ ...product, buyer: buyer.name });
    setInputValue(buyer.name);
    setFilteredBuyers([]);
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
        {newStyles.length > 0 && (
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
            <button
              onClick={handleSubmitProcesses}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Submit Processes
            </button>
          </div>
        )}
      </div>
      <h1 className="text-2xl font-bold mb-4">Add Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Sr No</label>
          <input
            type="text"
            name="srNo"
            value={product.srNo}
            onChange={handleChange}
            placeholder="Sr No"
            className="mt-1 p-2 border border-gray-300 rounded w-full"
          />
        </div>
        <div>
          <label className="block text-gray-700">Buyer</label>
          <input
            type="text"
            name="buyer"
            value={inputValue}
            onChange={handleChange}
            placeholder="Buyer"
            className="mt-1 p-2 border border-gray-300 rounded w-full"
          />
          {filteredBuyers.length > 0 && (
            <ul className="mt-2 border border-gray-300 rounded bg-white shadow-lg">
              {filteredBuyers.map((buyer, index) => (
                <li
                  key={index}
                  onClick={() => handleSelectBuyer(buyer)}
                  className="p-2 hover:bg-gray-200 cursor-pointer"
                >
                  {buyer.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <label className="block text-gray-700">Buyer PO</label>
          <input
            type="text"
            name="buyerPO"
            value={product.buyerPO}
            onChange={handleChange}
            placeholder="Buyer PO"
            className="mt-1 p-2 border border-gray-300 rounded w-full"
          />
        </div>
        <div>
          <label className="block text-gray-700">Color</label>
          <input
            type="text"
            name="color"
            value={product.color}
            onChange={handleChange}
            placeholder="Color"
            className="mt-1 p-2 border border-gray-300 rounded w-full"
          />
        </div>
        <div>
          <label className="block text-gray-700">Ex-Factory Date</label>
          <input
            type="date"
            name="exFactoryDate"
            value={product.exFactoryDate}
            onChange={handleChange}
            className="mt-1 p-2 border border-gray-300 rounded w-full"
          />
        </div>
        <div>
          <label className="block text-gray-700">Style Name</label>
          <input
            type="text"
            name="styleName"
            value={product.styleName}
            onChange={handleChange}
            placeholder="Style Name"
            className="mt-1 p-2 border border-gray-300 rounded w-full"
          />
        </div>
        <div>
          <label className="block text-gray-700">Size</label>
          <input
            type="text"
            name="size"
            value={product.size}
            onChange={handleChange}
            placeholder="Size"
            className="mt-1 p-2 border border-gray-300 rounded w-full"
          />
        </div>
        <div>
          <label className="block text-gray-700">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={product.quantity}
            onChange={handleChange}
            placeholder="Quantity"
            className="mt-1 p-2 border border-gray-300 rounded w-full"
          />
        </div>
        <div>
          <label htmlFor="processes" className="block font-semibold mb-2">
            Processes
          </label>
          {processes.map((process, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="checkbox"
                id={process}
                name="processes"
                checked={product.processes.some(
                  (p) => p.processName === process
                )}
                onChange={() => handleCheckboxChange(process)}
                className="mr-2"
              />
              <label htmlFor={process} className="flex items-center">
                {process}
                {product.processes.some((p) => p.processName === process) && (
                  <span className="ml-2 text-gray-500">
                    Order:{" "}
                    {
                      product.processes.find((p) => p.processName === process)
                        .order
                    }
                  </span>
                )}
              </label>
            </div>
          ))}
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
