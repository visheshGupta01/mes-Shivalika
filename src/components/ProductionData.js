import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  updateProductionEntry,
  filterProductsByProcess,
} from "../redux/slices/productionSlice";
import api from "../api/axiosConfig";
import LoadingSpinner from "./loadingSpinner";

const ProductionData = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const userRole = user.userType;
  const products = useSelector((state) => state.production.filteredProducts);
  const processes = useSelector((state) => state.processes.processes);
  const machinesCapacities = useSelector(
    (state) => state.machinesCapacity.machinesCapacity
  );
  const [selectedProcess, setSelectedProcess] = useState("");
  const [editValues, setEditValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [missingSizes, setMissingSizes] = useState([]);
  const [highlightedInput, setHighlightedInput] = useState(null);
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
    const fetchData = async () => {
      setLoading(true);
      await dispatch(fetchProducts());
      setLoading(false);
    };

    fetchData();
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

  const getWeekdays = () => {
    const today = new Date();
    const currentDay = today.getDay(); // Get the current day of the week (0 for Sunday, 1 for Monday, etc.)

    // Calculate how many days to subtract to get to Monday
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

    const monday = new Date();
    monday.setDate(today.getDate() + mondayOffset); // Set to Monday

    const weekdays = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekdays.push(
        date.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        })
      );
    }

    return weekdays;
  };
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
    setLoading(true); // Set loading to true immediately
    console.log("Loading state set to true"); // This should appear in the console

    try {
      // Dispatch to filter products by selected process
      await dispatch(filterProductsByProcess(processName));

      // Check for missing production data
      const missingSizes = checkMissingProductionData(processName);
      setMissingSizes(missingSizes);

      // If missing sizes are found, show the modal to enter production data
      if (missingSizes.length > 0) {
        setShowInputModal(true);
      }
    } catch (error) {
      console.error("Error changing process:", error);
    } finally {
      setLoading(false); // Stop loading after all operations are done
    }
  };
  const handleProductionInputChange = (size, value) => {
    setProductionEntries((prevEntries) => ({
      ...prevEntries,
      [size]: value,
    }));
  };

  const handleSaveProductionData = async () => {
    setLoading(true);
    try {
      await saveProductionData(selectedProcess, productionEntries);
      setShowInputModal(false);
      setProductionEntries({});
    } catch (error) {
      console.error("Failed to save production data", error);
    } finally {
      setLoading(false);
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
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (products) {
      console.log(products);
    }
  }, [products]);

  const updateProductionPerDayPerMachine = async (
    filteredProductsBySizes,
    processName,
    newProductionValue
  ) => {
    try {
      setLoading(true);
      await api.post("/productionData/updateProductionPerDayPerMachine", {
        filteredProductsBySizes,
        processName,
        productionPerDayPerMachine: newProductionValue,
      });
      dispatch(fetchProducts());
    } catch (error) {
      console.error("Failed to update production per day per machine", error);
    } finally {
      setLoading(false);
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
    let daysRemaining = 0;

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
        ).then(() => {
          // Set the highlighted input when the update is successful
          setHighlightedInput(`${processId}_${date}`);

          // Remove the highlight after 2 seconds
          setTimeout(() => setHighlightedInput(null), 2000);
        });
      }
    }
  };

  const isEditable = (entry, userRole) => {
    if (userRole === "Admin") {
      return true;
    }
    return !entry;
  };

  // Capacity Planning Variables
  let accumulatedMachines = 0;
  const machineCapacity = machinesCapacities[selectedProcess] || Infinity;
  let underlineShown = false; // Flag to track whether the underline has been shown

  return (
    <div className="p-4 bg-gray-100">
      {loading && <LoadingSpinner />} {/* Show LoadingSpinner when loading */}
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
      <div className="overflow-x-auto max-h-screen bg-white shadow-lg rounded-lg">
        <table className="min-w-full text-center bg-white border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr className="bg-gray-200 text-gray-600 text-xs leading-normal">
              <th className="py-2 px-3 sticky top-0 z-10 ">Start Date</th>
              <th className="py-2 px-3 sticky top-0 z-10">End Date</th>
              <th className="py-2 px-3 sticky top-0 z-10">Days</th>
              <th className="py-2 px-3 sticky top-0 z-10">Per Day Prod.</th>
              <th className="py-2 px-3 sticky top-0 z-10">Mach. Plan</th>
              <th
                onClick={(e) => handleHeaderClick("srNo", e)}
                className="py-2 px-3 sticky top-0 z-10 cursor-pointer"
              >
                SR No
              </th>
              <th
                onClick={(e) => handleHeaderClick("buyer", e)}
                className="py-2 px-3 sticky top-0 z-10 cursor-pointer"
              >
                Buyer
              </th>
              <th
                onClick={(e) => handleHeaderClick("buyerPO", e)}
                className="py-2 px-3 sticky top-0 z-10 cursor-pointer"
              >
                Buyer PO
              </th>
              <th className="py-2 px-3 sticky top-0 z-10">Color</th>
              <th
                onClick={(e) => handleHeaderClick("exFactoryDate", e)}
                className="py-2 px-3 sticky top-0 z-10 cursor-pointer"
              >
                Ex-Factory Date
              </th>
              <th
                onClick={(e) => handleHeaderClick("styleName", e)}
                className="py-2 px-3 sticky top-0 z-10 cursor-pointer"
              >
                Style
              </th>
              <th className="py-2 px-3 sticky top-0 z-10">Size</th>
              <th className="py-2 px-3 sticky top-0 z-10">Qty.</th>
              <th className="py-2 px-3 sticky top-0 z-10">Total Prod.</th>
              <th className="py-2 px-3 sticky top-0 z-10">Bal. Qty.</th>
              {getWeekdays().map((date, index) => (
                <th
                  key={index}
                  className="py-2 px-3 sticky top-0 z-10 whitespace-nowrap"
                >
                  {date}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-gray-600 text-[11px] font-light">
            {filteredProducts.map((product) => {
              return (
                <React.Fragment key={product._id}>
                  {selectedProcess &&
                    product.processes.map((process) => {
                      if (process.processName === selectedProcess) {
                        const totalProduced = process.entries.reduce(
                          (sum, entry) => sum + entry.quantity,
                          0
                        );
                        const totalRemaining = product.quantity - totalProduced;
                        const daysRemaining = calculateDaysRemaining(
                          Date.now(),
                          process.endDate
                        );
                        const perDay = process.productionPerDayPerMachine || 0;
                        const machinesNeeded =
                          perDay && daysRemaining
                            ? Math.ceil(
                                totalRemaining / (perDay * daysRemaining)
                              )
                            : "N/A";

                        if (machinesNeeded !== "N/A") {
                          accumulatedMachines += Number(machinesNeeded);
                        }

                        const showThickLine =
                          !underlineShown &&
                          accumulatedMachines >= machineCapacity;

                        if (showThickLine) {
                          underlineShown = true; // Set the flag to true once the line is added
                        }
                        return (
                          <tr
                            key={process._id}
                            className={
                              showThickLine ? "border-b-4 border-red-700" : ""
                            }
                          >
                            <td className="py-2 px-3 font-bold">
                              {process.startDate
                                ? new Date(
                                    process.startDate
                                  ).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                  })
                                : "N/A"}
                            </td>{" "}
                            <td className="py-2 px-3 font-bold">
                              {process.endDate
                                ? new Date(process.endDate).toLocaleDateString(
                                    "en-GB",
                                    {
                                      day: "numeric",
                                      month: "short",
                                    }
                                  )
                                : "N/A"}
                            </td>
                            <td className="py-2 px-3 font-bold">
                              {daysRemaining}
                            </td>
                            <td className="py-2 px-3 font-bold">
                              {process.productionPerDayPerMachine}
                            </td>
                            <td className="py-2 px-3 font-bold">
                              {machinesNeeded}
                            </td>
                            <td className="py-2 px-3 font-bold">
                              {product.srNo}
                            </td>
                            <td className="py-2 px-3 font-bold">
                              {product.buyer}
                            </td>
                            <td className="py-2 px-3 font-bold">
                              {product.buyerPO}
                            </td>
                            <td className="py-2 px-3 font-bold">
                              {product.color}
                            </td>
                            <td className="py-2 px-3 font-bold">
                              {new Date(
                                product.exFactoryDate
                              ).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                              })}
                            </td>
                            <td className="py-2 px-3 font-bold">
                              {product.styleName}
                            </td>
                            <td className="py-2 px-3 font-bold">
                              {product.size}
                            </td>
                            <td className="py-2 px-3 font-bold">
                              {product.quantity}
                            </td>
                            <td className="py-2 px-3 font-bold">
                              {process.totalProduction}
                            </td>
                            <td className="py-2 px-3 font-bold">
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
                                <td key={day} className="py-1 px-2 font-bold">
                                  <input
                                    type="text"
                                    inputmode="numeric"
                                    className={`w-full p-1 text-xs border rounded-md focus:outline-none ${
                                      highlightedInput === inputKey
                                        ? "bg-green-300 focus:ring-green-500 focus:border-green-500"
                                        : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                    }`}
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
                          </tr>
                        );
                      }
                      return null;
                    })}
                </React.Fragment>
              );
            })}
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
