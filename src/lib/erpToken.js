import axios from "axios";
import qs from "qs";

export const generateToken = async () => {

  const data = qs.stringify({
    username: process.env.ERP_USERNAME,
    password: process.env.ERP_PASSWORD,
    grant_type: "password",
    client_id: "api_access",
    scope: "openid offline_access"
  });

  const res = await axios.post(
    process.env.ERP_TOKEN_URL,
    data,
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  return res.data.access_token;
};