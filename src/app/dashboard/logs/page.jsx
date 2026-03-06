"use client";

import { useEffect, useState } from "react";

export default function Logs() {

  const [logs, setLogs] = useState([]);

  useEffect(() => {

    const load = async () => {

      const res = await fetch("/api/logs");
      const data = await res.json();

      setLogs(data);

    };

    load();

  }, []);

  return (

    <div className="p-10">

      <h1 className="text-2xl font-bold">
        Webhook Logs
      </h1>

      {logs.map(log => (

        <pre key={log._id}>
          {JSON.stringify(log.payload, null, 2)}
        </pre>

      ))}

    </div>

  );

}