import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  updateProductionEntry,
  filterProductsByProcess,
} from "../redux/slices/productionSlice";
import api from "../api/axiosConfig";

const ProductionData = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const userRole = user.userType;
  const processes = useSelector((state) => state.processes.processes);
  const products = useSelector((state) => state.production.filteredProducts);
  const [selectedProcess, setSelectedProcess] = useState("");
  const [editValues, setEditValues] = useState({});
  const [missingSizes, setMissingSizes] = useState([]);
  const [productionEntries, setProductionEntries] = useState({});
  const [showInputModal, setShowInputModal] = useState(false);
  const [filterDialog, setFilterDialog] = useState({
    visible: false,
    column: "",
    position: { x: 0, y: 0 },
  });
  const [filterValues, setFilterValues] = useState({
    srNo: "",
    buyer: "",
    buyerPO: "",
    exFactoryDate: "",
    styleName: "",
  });

  const dialogRef = useRef(null);

  useEffect(() => {
    dispatch(fetchProducts());

    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        closeDialog();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dispatch]);

  const handleHeaderClick = (column, event) => {
    const rect = event.target.getBoundingClientRect();
    setFilterDialog({
      visible: true,
      column: column,
      position: { x: rect.left, y: rect.bottom },
    });
  };
  const handleFilterInputChange = (e) => {
    const value = e.target.value;
    setFilterValues((prevValues) => ({
      ...prevValues,
      [filterDialog.column]: value,
    }));
  };
  const closeDialog = () => {
    setFilterDialog({ visible: false, column: "", position: { x: 0, y: 0 } });
  };

  const handleProcessChange = async (e) => {
    const processName = e.target.value;
    setSelectedProcess(processName);

    // Dispatch to filter products by selected process
    dispatch(filterProductsByProcess(processName));

    // Check for missing production data
    const missingSizes = checkMissingProductionData(processName);
    setMissingSizes(missingSizes);

    // If missing sizes are found, show the modal to enter production data
    if (missingSizes.length > 0) {
      setShowInputModal(true);
    }
  };
  const handleProductionInputChange = (size, value) => {
    setProductionEntries((prevEntries) => ({
      ...prevEntries,
      [size]: value,
    }));
  };

  const handleSaveProductionData = async () => {
    try {
      await saveProductionData(selectedProcess, productionEntries);
      setShowInputModal(false);
      setProductionEntries({});
    } catch (error) {
      console.error("Failed to save production data", error);
    }
  };
  const checkMissingProductionData = (processName) => {
    const missingSizes = [];

    products.forEach((product) => {
      const process = product.processes.find(
        (process) => process.processName === processName
      );

      if (process) {
        if (
          process.productionPerDayPerMachine === null ||
          process.productionPerDayPerMachine === undefined
        ) {
          missingSizes.push(product.size);
        }
      }
      console.log(missingSizes);
    });

    return [...new Set(missingSizes)];
  };

  const saveProductionData = async (processName, enteredData) => {
    try {
      await api.post("/productionData/addProduction", {
        processName,
        productionData: enteredData,
      });

      for (const [size, value] of Object.entries(enteredData)) {
        const filteredProductsBySizes = products.filter((p) => p.size === size);
        console.log(filteredProductsBySizes);
        if (filteredProductsBySizes) {
          console.log(filteredProductsBySizes);
          await updateProductionPerDayPerMachine(
            filteredProductsBySizes,
            processName,
            value
          );
        }
      }

      dispatch(fetchProducts());
    } catch (error) {
      console.error("Failed to save production data", error);
    }
  };

  const updateProductionPerDayPerMachine = async (
    filteredProductsBySizes,
    processName,
    newProductionValue
  ) => {
    try {
      await api.post("/productionData/updateProductionPerDayPerMachine", {
        filteredProductsBySizes,
        processName,
        productionPerDayPerMachine: newProductionValue,
      });
      dispatch(fetchProducts());
    } catch (error) {
      console.error("Failed to update production per day per machine", error);
    }
  };

  const handleInputChange = (processId, date, value) => {
    setEditValues({
      ...editValues,
      [`${processId}_${date}`]: value,
    });
  };

  const calculateDaysRemaining = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let daysRemaining = 1;

    while (start <= end) {
      const dayOfWeek = start.getDay();
      if (dayOfWeek !== 0) {
        // Exclude Sundays
        daysRemaining++;
      }
      // Move to the next day, which automatically handles month lengths
      start.setDate(start.getDate() + 1);
    }

    return daysRemaining;
  };

  const filteredProducts = products
    .filter((product) => !product.completed) // Exclude completed products
    .filter((product) => {
      return (
        (filterValues.srNo === "" ||
          product.srNo.includes(filterValues.srNo)) &&
        (filterValues.buyer === "" ||
          product.buyer.includes(filterValues.buyer)) &&
        (filterValues.buyerPO === "" ||
          product.buyerPO.includes(filterValues.buyerPO)) &&
        (filterValues.exFactoryDate === "" ||
          new Date(product.exFactoryDate)
            .toLocaleDateString("en-GB", { day: "numeric", month: "short" })
            .includes(filterValues.exFactoryDate)) &&
        (filterValues.styleName === "" ||
          product.styleName.includes(filterValues.styleName))
      );
    })
    .sort((a, b) => new Date(a.exFactoryDate) - new Date(b.exFactoryDate));

  const handleKeyDown = (e, productId, processId, date) => {
    if (e.key === "Enter") {
      const quantity = editValues[`${processId}_${date}`];
      if (quantity !== undefined) {
        dispatch(
          updateProductionEntry({ id: productId, processId, date, quantity })
        );
      }
    }
  };

  const isEditable = (entry, userRole) => {
    if (userRole === "Admin") {
      return true;
    }
    return !entry;
  };

  return (
    <div className="p-4 bg-gray-100">
      <div className="mb-4">
        <label
          htmlFor="processSelect"
          className="block text-sm font-medium text-gray-700"
        >
          Select Process:
        </label>
        <select
          id="processSelect"
          value={selectedProcess}
          onChange={handleProcessChange}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">All Processes</option>
          {processes.map((process) => (
            <option key={process} value={process}>
              {process}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-dvh ">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                End Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Days Remaining
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Per Day Production
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Machines Needed
              </th>
              <th
                onClick={(e) => handleHeaderClick("srNo", e)}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer relative"
              >
                SR No
              </th>
              <th
                onClick={(e) => handleHeaderClick("buyer", e)}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer relative"
              >
                Buyer
              </th>
              <th
                onClick={(e) => handleHeaderClick("buyerPO", e)}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer relative"
              >
                Buyer PO
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Color
              </th>
              <th
                onClick={(e) => handleHeaderClick("exFactoryDate", e)}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer relative"
              >
                Ex-Factory Date
              </th>
              <th
                onClick={(e) => handleHeaderClick("styleName", e)}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer relative"
              >
                Style Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Produced
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Remaining
              </th>
              {[...Array(6).keys()].map((day) => (
                <th
                  key={day}
                  className="px-6 py-3 text-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {new Date(
                    Date.now() + day * 24 * 60 * 60 * 1000
                  ).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts &&
              filteredProducts.length > 0 &&
              filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  {selectedProcess &&
                    product.processes.map((process) => {
                      if (process.processName === selectedProcess) {
                        const totalProduced = process.entries.reduce(
                          (sum, entry) => sum + entry.quantity,
                          0
                        );
                        const totalRemaining = product.quantity - totalProduced;
                        const daysRemaining = Math.ceil(
                          (new Date(process.endDate) - Date.now()) /
                            (1000 * 60 * 60 * 24)
                        );
                        const perDay = process.productionPerDayPerMachine || 0;
                        const machinesNeeded = perDay
                          ? Math.ceil(totalRemaining / (perDay * daysRemaining))
                          : "N/A";

                        return (
                          <React.Fragment key={process._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {process.startDate
                                ? new Date(
                                    process.startDate
                                  ).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                  })
                                : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {process.endDate
                                ? new Date(process.endDate).toLocaleDateString(
                                    "en-GB",
                                    { day: "numeric", month: "short" }
                                  )
                                : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {calculateDaysRemaining(
                                Date.now(),
                                process.endDate
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {process.productionPerDayPerMachine}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {machinesNeeded}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.srNo}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.buyer}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.buyerPO}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.color}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(
                                product.exFactoryDate
                              ).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.styleName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.size}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {totalProduced}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {totalRemaining}
                            </td>
                            {[...Array(6).keys()].map((day) => {
                              const date = new Date(
                                Date.now() + day * 24 * 60 * 60 * 1000
                              );
                              const entry = process.entries.find(
                                (entry) =>
                                  new Date(entry.date).toDateString() ===
                                  date.toDateString()
                              );
                              const inputKey = `${
                                process._id
                              }_${date.toDateString()}`;
                              return (
                                <td
                                  key={day}
                                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                >
                                  <input
                                    type="text"
                                    inputmode="numeric"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={
                                      editValues[inputKey] !== undefined
                                        ? editValues[inputKey]
                                        : entry
                                        ? entry.quantity
                                        : ""
                                    }
                                    onChange={(e) =>
                                      handleInputChange(
                                        process._id,
                                        date.toDateString(),
                                        Number(e.target.value)
                                      )
                                    }
                                    onKeyDown={(e) =>
                                      handleKeyDown(
                                        e,
                                        product._id,
                                        process._id,
                                        date.toDateString()
                                      )
                                    }
                                    disabled={!isEditable(entry, userRole)}
                                  />
                                </td>
                              );
                            })}
                          </React.Fragment>
                        );
                      }
                      return null;
                    })}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {/* Modal for entering missing production data */}
      {showInputModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              Enter Production Data for Missing Sizes
            </h2>
            {missingSizes.map((size) => (
              <div key={size} className="mb-3">
                <label
                  htmlFor={`production-${size}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Production for size {size}:
                </label>
                <input
                  type="number"
                  id={`production-${size}`}
                  value={productionEntries[size] || ""}
                  onChange={(e) =>
                    handleProductionInputChange(size, e.target.value)
                  }
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            ))}
            <button
              onClick={handleSaveProductionData}
              className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded-md"
            >
              Save
            </button>
          </div>
        </div>
      )}
      {filterDialog.visible && (
        <div
          ref={dialogRef}
          className="absolute bg-white border border-gray-300 p-2 rounded-md shadow-lg"
          style={{
            top: filterDialog.position.y,
            left: filterDialog.position.x,
          }}
        >
          <input
            type="text"
            value={filterValues[filterDialog.column]}
            onChange={handleFilterInputChange}
            className="p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder={`Filter by ${filterDialog.column}`}
          />
          <button
            onClick={closeDialog}
            className="ml-2 bg-indigo-500 text-white px-2 py-1 rounded-md"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductionData;
