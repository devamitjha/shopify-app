"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {

  const [orders, setOrders] = useState([]);
  const [selectedPayload, setSelectedPayload] = useState(null);

  const loadOrders = async () => {

    const res = await fetch("/api/orders");
    const data = await res.json();

    setOrders(data);

  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleEdit = (payload) => {

    setSelectedPayload(JSON.stringify(payload, null, 2));

  };

  const sendToERP = async () => {

    const res = await fetch("/api/resend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        payload: JSON.parse(selectedPayload)
      })
    });

    const data = await res.json();

    alert(data.status === "success"
      ? "Order Sent Successfully"
      : "Failed to Send Order"
    );

    setSelectedPayload(null);

    loadOrders();

  };

  return (

    <div className="p-10">

      <h1 className="text-2xl font-bold mb-6">
        Shopify → ERP Orders
      </h1>

      <table className="w-full border">

        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Order ID</th>
            <th className="p-2">Status</th>
            <th className="p-2">Error</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>

        <tbody>

          {orders.map(order => (

            <tr key={order._id} className="border">

              {/* ORDER NUMBER */}
              <td className="p-2">
                {order.erpPayload?.order?.order_no}
              </td>

              {/* STATUS */}
              <td className="p-2">

                {order.status === "success"
                  ? <span className="text-green-600">Success</span>
                  : <span className="text-red-600">Failed</span>
                }

              </td>

              {/* ERROR MESSAGE */}
              <td className="p-2 text-red-600">

                {order.erpResponse?.Error?.Message || "-"}

              </td>

              {/* ACTION BUTTONS */}
              <td className="p-2 flex gap-2">

                <button
                  onClick={() => alert(JSON.stringify(order.erpPayload, null, 2))}
                  className="bg-gray-600 text-white px-3 py-1 rounded"
                >
                  View
                </button>

                <button
                  onClick={() => handleEdit(order.erpPayload)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleEdit(order.erpPayload)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Retry
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

      {selectedPayload && (

        <div className="mt-10">

          <h2 className="text-xl font-bold mb-3">
            Edit Payload
          </h2>

          <textarea
            value={selectedPayload}
            onChange={(e) => setSelectedPayload(e.target.value)}
            className="w-full h-96 border p-4 font-mono"
          />

          <div className="mt-4 flex gap-4">

            <button
              onClick={sendToERP}
              className="bg-green-600 text-white px-5 py-2 rounded"
            >
              Send To ERP
            </button>

            <button
              onClick={() => setSelectedPayload(null)}
              className="bg-gray-500 text-white px-5 py-2 rounded"
            >
              Cancel
            </button>

          </div>

        </div>

      )}

    </div>

  );
}