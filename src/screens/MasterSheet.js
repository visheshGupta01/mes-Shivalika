import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../redux/slices/orderSlice";
import moment from "moment";
import api from "../api/axiosConfig";
import LoadingSpinner from "../components/loadingSpinner";

const MasterSheet = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orders);
  const [selectedOrder, setSelectedOrder] = useState(null); // State for selected order
  const [orderDetails, setOrderDetails] = useState([]); // State for product details
  const [selectedProduct, setSelectedProduct] = useState(null); // State for selected product
  const currentWeekRef = useRef(null);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  useEffect(() => {
    if (currentWeekRef.current) {
      currentWeekRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [orders]);

  const isCurrentWeek = (date) => {
    const startOfWeek = moment().startOf("week");
    const endOfWeek = moment().endOf("week");
    return moment(date).isBetween(startOfWeek, endOfWeek, null, "[]");
  };

  const handleOrderClick = async (order) => {
    setSelectedOrder(order);
    setSelectedProduct(null); // Reset the selected product when a new order is selected

    // Fetch product details using the product IDs in the order
    const productIds = order.products.map((product) => product.productId);
    try {
      const response = await api.post("/product/getProductDetails", {
        ids: productIds,
      });
      setOrderDetails(response.data);
    } catch (error) {
      console.error("Error fetching product/process details:", error);
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product); // Set the clicked product as selected
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex p-2 space-x-4">
      {loading && <LoadingSpinner />}
      {/* First Section: Orders List */}
      <div className="w-1/4 h-[calc(100vh-96px)] border-r bg-white shadow-lg overflow-y-auto">
        <table className="min-w-full font-bold text-center text-[11px]">
          <thead className="sticky top-0 bg-white">
            <tr>
              <th className="font-semibold p-1 border-b">Ex-Factory Date</th>
              <th className="font-semibold p-1 border-b">Buyer</th>
              <th className="font-semibold p-1 border-b">Sr No</th>
              <th className="font-semibold p-1 border-b">Buyer PO</th>
              <th className="font-semibold p-1 border-b">Week</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.srNo}
                ref={isCurrentWeek(order.exFactoryDate) ? currentWeekRef : null}
                className={`cursor-pointer ${
                  isCurrentWeek(order.exFactoryDate) ? "bg-green-100" : ""
                }`}
                onClick={() => handleOrderClick(order)}
              >
                <td className="p-1 border-b">
                  {moment(order.exFactoryDate).format("DD-MM-YYYY")}
                </td>
                <td className="p-1 border-b">{order.buyer}</td>
                <td className="p-1 border-b">{order.srNo}</td>
                <td className="p-1 border-b">{order.buyerPO}</td>
                <td className="p-1 border-b">{order.week}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Second Section: Selected Order's Products */}
      <div className="w-1/4">
        {selectedOrder ? (
          <table className="min-w-full font-bold text-center text-[11px]">
            <thead className="bg-white">
              <tr>
                <th className="font-semibold p-1 border-b">Style Name</th>
                <th className="font-semibold p-1 border-b">Quantity</th>
                <th className="font-semibold p-1 border-b">Size</th>
                <th className="font-semibold p-1 border-b">Color</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails.map((product, index) => (
                <tr
                  key={index}
                  className="border-b p-2 cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  <td className="p-1 border-b">{product.styleName}</td>
                  <td className="p-1 border-b">{product.quantity}</td>
                  <td className="p-1 border-b">{product.size}</td>
                  <td className="p-1 border-b">{product.color}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Select an order to view product details.</p>
        )}
      </div>

      {/* Third Section: Selected Product's Processes */}
      <div className="w-2/4">
        {selectedProduct ? (
          <table className="min-w-full font-bold text-center text-[11px]">
            <thead className="bg-white">
              <tr>
                {selectedProduct.processes.map((process, index) => (
                  <th key={index} className="font-semibold p-1 border-b">
                    {process.processName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {selectedProduct.processes.map((process, index) => (
                  <td key={index} className="p-1 border-b">
                    {process.totalProduction}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        ) : (
          <p>Select a product to view process details.</p>
        )}
      </div>
    </div>
  );
};

export default MasterSheet;
