import React, { useState,useEffect} from "react";

const ProductionModal = ({
  onClose,
  selectedProductionData,
  saveProductionData,
}) => {
  const [localProductionData, setLocalProductionData] = useState(
    selectedProductionData || {}
  );

  useEffect(() => {
    setLocalProductionData(selectedProductionData); // Sync state with the passed data when the modal opens
  }, [selectedProductionData]);

  const handleProductionChange = (field, value) => {
    setLocalProductionData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSave = () => {
    saveProductionData(localProductionData); // Save the data
    onClose(); // Close modal after saving
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded shadow-md w-1/2 relative">
        <button
          className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          onClick={onClose}
        >
          Close
        </button>
        <h2 className="text-xl font-semibold mb-4">Add Production Data</h2>
        <table className="table-auto w-full mb-4">
          <thead>
            <tr>
              <th className="border px-4 py-2">Process</th>
              <th className="border px-4 py-2">Size</th>
              <th className="border px-4 py-2">
                Production Per Day Per Machine
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">{localProductionData.processName}</td>
              <td className="border px-4 py-2">{localProductionData.size}</td>
              <td className="border px-4 py-2">
                <input
                  type="number"
                  value={localProductionData.productionPerDayPerMachine || ""}
                  onChange={(e) =>
                    handleProductionChange(
                      "productionPerDayPerMachine",
                      e.target.value
                    )
                  }
                  className="border p-2 w-full"
                  placeholder="Enter production data"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={handleSave}
        >
          Save & Close
        </button>
      </div>
    </div>
  );
};

export default ProductionModal;
