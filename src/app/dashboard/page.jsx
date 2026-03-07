"use client";

import { useEffect, useState} from "react";
import React from "react";
import { useAuthStore } from "@/store/authStore";


export default function Dashboard() {
  const { logout } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [queue, setQueue] = useState({});
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [selectedPayload, setSelectedPayload] = useState(null);
  const [retryOrderId, setRetryOrderId] = useState(null);  

  const loadOrders = async () => {
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data);
  };

  const loadQueue = async () => {
    const res = await fetch("/api/queue");
    const data = await res.json();
    setQueue(data);
  };

  useEffect(() => {
    loadOrders();
    loadQueue();
    const interval = setInterval(() => {
      loadOrders();
      loadQueue();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleExpand = (orderId) => {

    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }

  };

  const handleEdit = (orderId, payload) => {

    setRetryOrderId(orderId);
    setSelectedPayload(JSON.stringify(payload, null, 2));

  };

  const sendToERP = async () => {

    const res = await fetch("/api/resend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        orderId: retryOrderId,
        payload: JSON.parse(selectedPayload)
      })
    });

    const data = await res.json();

    alert(data.message || "Retry sent");

    setSelectedPayload(null);
    setRetryOrderId(null);

    loadOrders();

  };

  const getStatusBadge = (status) => {

    if (status === "success")
      return "bg-green-100 text-green-700";

    if (status === "failed")
      return "bg-red-100 text-red-700";

    if (status === "queued")
      return "bg-yellow-100 text-yellow-700";

    return "bg-gray-100 text-gray-700";

  };

  return (

    <div className="p-10">
      <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold">
        Shopify → ERP Monitor
      </h1>
      <button
        onClick={logout}
        className="ml-auto bg-red-500 text-white px-4 py-2 rounded cursor-pointer"
      >
        Logout
      </button>
      </div>

      {/* QUEUE STATUS */}

      <div className="grid grid-cols-4 gap-6 mb-10">

        <div className="bg-yellow-100 p-5 rounded-lg">
          <p className="text-sm text-gray-500">Waiting</p>
          <p className="text-2xl font-bold">
            {queue.waiting || 0}
          </p>
        </div>

        <div className="bg-blue-100 p-5 rounded-lg">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold">
            {queue.active || 0}
          </p>
        </div>

        <div className="bg-green-100 p-5 rounded-lg">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold">
            {queue.completed || 0}
          </p>
        </div>

        <div className="bg-red-100 p-5 rounded-lg">
          <p className="text-sm text-gray-500">Failed</p>
          <p className="text-2xl font-bold">
            {queue.failed || 0}
          </p>
        </div>

      </div>

      {/* ORDERS TABLE */}

      <div className="border rounded-lg overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>
              <th className="p-3 text-left">Order</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Error</th>
              <th className="p-3 text-left">Actions</th>
            </tr>

          </thead>

          <tbody>

            {orders.map(order => (

              <React.Fragment key={order.shopifyOrderId || order._id}>

                <tr className="border-t">

                  <td className="p-3 font-medium">
                    {order.erpPayload?.order?.order_no}
                  </td>

                  <td className="p-3">

                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>

                  </td>

                  <td className="p-3 text-red-600 text-sm">
                    {order.erpResponse?.Error?.Message || "-"}
                  </td>

                  <td className="p-3 flex gap-2 flex-wrap">

                    {/* VIEW */}

                    <button
                      onClick={() =>
                        toggleExpand(order._id)
                      }
                      className="bg-gray-700 text-white px-3 py-1 rounded"
                    >
                      View
                    </button>

                    {order.status === "failed" && (

                      <>
                        <button
                          onClick={() =>
                            handleEdit(
                              order.shopifyOrderId,
                              order.erpPayload
                            )
                          }
                          className="bg-blue-500 text-white px-3 py-1 rounded"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleEdit(
                              order.shopifyOrderId,
                              order.erpPayload
                            )
                          }
                          className="bg-green-600 text-white px-3 py-1 rounded"
                        >
                          Retry
                        </button>
                      </>

                    )}

                  </td>

                </tr>

                {expandedOrder === order._id && (

                  <tr className="bg-gray-50">

                    <td colSpan="4" className="p-5">

                      <div className="grid grid-cols-2 gap-6">

                        <div>

                          <h3 className="font-semibold mb-2">
                            ERP Request
                          </h3>

                          <pre className="bg-white border p-4 rounded text-sm overflow-auto">
                            {JSON.stringify(order.erpPayload, null, 2)}
                          </pre>

                        </div>

                        <div>

                          <h3 className="font-semibold mb-2">
                            ERP Response
                          </h3>

                          <pre className="bg-white border p-4 rounded text-sm overflow-auto">
                            {JSON.stringify(order.erpResponse, null, 2)}
                          </pre>

                        </div>

                      </div>

                    </td>

                  </tr>

                )}

              </React.Fragment>

            ))}

          </tbody>

        </table>

      </div>

      {/* PAYLOAD EDITOR */}

      {selectedPayload && (

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-6 shadow-lg">

          <h2 className="text-xl font-bold mb-4">
            Edit Payload
          </h2>

          <textarea
            value={selectedPayload}
            onChange={(e) =>
              setSelectedPayload(e.target.value)
            }
            className="w-full h-64 border p-4 font-mono"
          />

          <div className="mt-4 flex gap-4">

            <button
              onClick={sendToERP}
              className="bg-green-600 text-white px-6 py-2 rounded"
            >
              Send To ERP
            </button>

            <button
              onClick={() => {
                setSelectedPayload(null);
                setRetryOrderId(null);
              }}
              className="bg-gray-500 text-white px-6 py-2 rounded"
            >
              Cancel
            </button>

          </div>

        </div>

      )}

    </div>

  );

}