import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStyles, submitProcesses  } from "../redux/slices/styleSlice";
import { fetchProductions } from "../redux/slices/productionsSlice";
import LoadingSpinner from "./loadingSpinner";
import ProcessesModal from "./ProcessesModal";

const StylesAndProductions = () => {
  const dispatch = useDispatch();
  const styles = useSelector((state) => state.styles.styles);
  const productions = useSelector((state) => state.productions.productions);
  const stylesLoading = useSelector((state) => state.styles.loading);
  const productionsLoading = useSelector((state) => state.productions.loading);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [selectedProcesses, setSelectedProcesses] = useState({}); // Object to store processes per style

  // Predefined list of processes (could come from an API or be dynamic)
  const processList = useSelector((state) => state.processes.processes);

  useEffect(() => {
    dispatch(fetchStyles());
    dispatch(fetchProductions());
  }, [dispatch]);

  if (stylesLoading || productionsLoading) {
    return <LoadingSpinner />;
  }

  // Separate styles without processes from those with processes
  const stylesWithoutProcesses = styles.filter(
    (style) => !style.processes || style.processes.length === 0
  );
  const stylesWithProcesses = styles.filter(
    (style) => style.processes && style.processes.length > 0
  );

  const openModal = (style) => {
    setSelectedStyle(style);
    setSelectedProcesses([]); // Reset selected processes
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStyle(null);
    setSelectedProcesses([]);
  };

  const handleCheckboxChange = (styleName, process, checked) => {
    setSelectedProcesses((prev) => {
      const updated = { ...prev };
      const styleProcesses = updated[styleName] || [];

      if (checked) {
        styleProcesses.push({
          processName: process,
          order: styleProcesses.length + 1, // Track the order in which processes are added
        });
      } else {
        const index = styleProcesses.findIndex(
          (p) => p.processName === process
        );
        if (index !== -1) {
          styleProcesses.splice(index, 1);
        }
        // Reorder remaining processes to maintain correct order
        styleProcesses.forEach((p, i) => (p.order = i + 1));
      }

      updated[styleName] = styleProcesses;
      return updated;
    });
    console.log(selectedProcesses)
  };

 const handleProcessSave = () => {
   console.log(selectedStyle, selectedProcesses);
   if (selectedStyle) {
     console.log("Called");
     dispatch(
       submitProcesses({
         styleName: selectedStyle.styleName,
         processes: selectedProcesses[selectedStyle.styleName] || [], // Extract processes for the selected style
       })
     );
   }
   closeModal();
 };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Styles and Productions</h1>

      {/* Styles with No Processes Table */}
      <h2 className="text-xl font-semibold mb-4">Styles with No Processes</h2>
      {stylesWithoutProcesses.length === 0 ? (
        <p>All styles have processes assigned.</p>
      ) : (
        <table className="table-auto w-full mb-8">
          <thead>
            <tr>
              <th className="border px-4 py-2">Style Name</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stylesWithoutProcesses.map((style) => (
              <tr key={style.styleName}>
                <td className="border px-4 py-2">{style.styleName}</td>
                <td className="border px-4 py-2">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={() => openModal(style)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Styles with Processes Table */}
      <h2 className="text-xl font-semibold mb-4">Styles with Processes</h2>
      {stylesWithProcesses.length === 0 ? (
        <p>No styles with processes available.</p>
      ) : (
        <table className="table-auto w-full mb-8">
          <thead>
            <tr>
              <th className="border px-4 py-2">Style Name</th>
              <th className="border px-4 py-2">Processes</th>
            </tr>
          </thead>
          <tbody>
            {stylesWithProcesses.map((style) => (
              <tr key={style.styleName}>
                <td className="border px-4 py-2">{style.styleName}</td>
                <td className="border px-4 py-2">
                  {style.processes && style.processes.length > 0 ? (
                    <ul>
                      {style.processes.map((process) => (
                        <li key={process.processName}>
                          {process.processName} (Order: {process.order})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No processes available.</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Productions Table */}
      <h2 className="text-xl font-semibold mb-4">Productions</h2>
      {productions.length === 0 ? (
        <p>No productions available.</p>
      ) : (
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="border px-4 py-2">Process Name</th>
              <th className="border px-4 py-2">Size</th>
              <th className="border px-4 py-2">
                Production Per Day Per Machine
              </th>
            </tr>
          </thead>
          <tbody>
            {productions.map((production) => (
              <tr key={production.processName}>
                <td className="border px-4 py-2">{production.processName}</td>
                <td className="border px-4 py-2">
                  {production.sizes && production.sizes.length > 0 ? (
                    <ul>
                      {production.sizes.map((sizeObj) => (
                        <li key={sizeObj.size}>{sizeObj.size}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No sizes available.</p>
                  )}
                </td>
                <td className="border px-4 py-2">
                  {production.sizes && production.sizes.length > 0 ? (
                    <ul>
                      {production.sizes.map((sizeObj) => (
                        <li key={sizeObj.size}>
                          {sizeObj.productionPerDayPerMachine}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No production data available.</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal for Process Selection */}
      {isModalOpen && (
        <ProcessesModal
          onClose={closeModal}
          processes={processList}
          selectedProcesses={selectedProcesses[selectedStyle?.styleName] || []}
          onSelectProcess={(process, checked) =>
            handleCheckboxChange(selectedStyle.styleName, process, checked)
          }
          saveProcesses={handleProcessSave}
        />
      )}
    </div>
  );
};

export default StylesAndProductions;
