import axios from "axios";

export const sendOrderToERP = async (token, payload) => {

  const res = await axios.post(
    process.env.ERP_ORDER_URL,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  );

  return res.data;
};