import React from "react";

const ProcessesModal = ({
  onClose,
  processes,
  selectedProcesses,
    onSelectProcess,
  saveProcesses
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded shadow-md w-1/2 relative">
        <button
          className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          onClick={onClose}
        >
          Close
        </button>
        <h2 className="text-xl font-semibold mb-4">Select Processes</h2>
        <ul>
          {processes.map((process) => {
            const selectedProcess = selectedProcesses.find(
              (p) => p.processName === process
            );

            return (
              <li key={process} className="mb-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    value={process}
                    checked={selectedProcesses.some(
                      (p) => p.processName === process
                    )}
                    onChange={(e) => onSelectProcess(process, e.target.checked)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2">
                    {process}
                    {selectedProcess
                      ? ` (Order: ${selectedProcess.order})`
                      : ""}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        <button
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={saveProcesses}
        >
          Save & Close
        </button>
      </div>
    </div>
  );
};


export default ProcessesModal;
