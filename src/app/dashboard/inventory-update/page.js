"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";

// Separate component for Error Table
function ErrorTable({ errorData }) {
  const columns = useMemo(
    () => [
      { accessorKey: "item_code", header: "Item Code" },
      { accessorKey: "inventoryItemId", header: "Inventory Item ID" },
      { accessorKey: "locationId", header: "Location ID" },
      { accessorKey: "quantity", header: "Quantity" },
      { accessorKey: "message", header: "Error Message" },
    ],
    []
  );

  const table = useReactTable({
    data: errorData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  const handleExportErrors = () => {
    const headers = columns.map(c => c.header).join(",");
    const csvContent = [
      headers,
      ...errorData.map(row => 
        columns.map(c => `"${row[c.accessorKey] ?? ""}"`).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "inventory_update_errors.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-red-700">Update Failures</h2>
        <button
          onClick={handleExportErrors}
          className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
        >
          Export Errors to CSV
        </button>
      </div>
      
      <div className="overflow-x-auto shadow-md rounded-lg border border-red-200">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-red-700 uppercase bg-red-50 border-b border-red-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 font-semibold whitespace-nowrap">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="bg-white border-b border-red-100 hover:bg-red-50 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex items-center justify-between mt-2 bg-red-50 p-2 rounded-lg border border-red-200">
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 border border-red-300 rounded bg-white text-red-700 hover:bg-red-50 disabled:opacity-50 text-xs font-medium transition-colors"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <button
            className="px-3 py-1 border border-red-300 rounded bg-white text-red-700 hover:bg-red-50 disabled:opacity-50 text-xs font-medium transition-colors"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-red-700">
            Page <span className="font-bold">{table.getState().pagination.pageIndex + 1}</span> of{" "}
            <span className="font-bold">{table.getPageCount()}</span>
          </span>
          <select
            className="border border-red-300 rounded px-2 py-1 text-xs bg-white text-red-700 focus:outline-none focus:ring-1 focus:ring-red-500"
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {[5, 10, 20, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default function InventoryUpdatePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    fetch("/api/inventory")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        if (Array.isArray(json)) {
          setData(json);
        } else {
          console.error("API returned non-array data:", json);
          setData([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch inventory data:", err);
        setData([]);
        setLoading(false);
      });
  }, []);

  const columns = useMemo(
    () => [
      { accessorKey: "pieces", header: "Pieces" },
      { accessorKey: "location_id", header: "Location ID" },
      { accessorKey: "location_name", header: "Location" },
      { accessorKey: "item_id", header: "Item ID" },
      { accessorKey: "item_code", header: "Item Code" },
      { accessorKey: "item_name", header: "Item Name" },
      { accessorKey: "company_id", header: "Company ID" },
      { accessorKey: "company_name", header: "Company" },
      { accessorKey: "shopify_location_id", header: "Shopify LOC ID" },
      { accessorKey: "item_group_id", header: "Group ID" },
      { accessorKey: "item_group_name", header: "Group" },
      { accessorKey: "shopify product id", header: "Shopify PID" },
      { accessorKey: "shopify product variant id", header: "Shopify VID" },
      { accessorKey: "shopify product inventory id", header: "Shopify IID" },
      { accessorKey: "is_bom", header: "BOM" },
      { accessorKey: "is_allocated", header: "Allocated" },
    ],
    []
  );

  const [showOnlyBlankIID, setShowOnlyBlankIID] = useState(false);

  // Pre-filter data based on Shopify IID toggle
  const filteredDataByToggle = useMemo(() => {
    if (showOnlyBlankIID) {
      return data.filter(
        (row) =>
          row["shopify product inventory id"] === null ||
          row["shopify product inventory id"] === undefined ||
          String(row["shopify product inventory id"]).trim() === ""
      );
    }
    return data;
  }, [data, showOnlyBlankIID]);

  const { totalCount, blankCount } = useMemo(() => {
    const total = data.length;
    const blank = data.filter(
      (row) =>
        row["shopify product inventory id"] === null ||
        row["shopify product inventory id"] === undefined ||
        String(row["shopify product inventory id"]).trim() === ""
    ).length;
    return { totalCount: total, blankCount: blank };
  }, [data]);

  const table = useReactTable({
    data: filteredDataByToggle,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const handleExportBlank = () => {
    const blankRows = data.filter(
      (row) =>
        row["shopify product inventory id"] === null ||
        row["shopify product inventory id"] === undefined ||
        String(row["shopify product inventory id"]).trim() === ""
    );
    
    if (blankRows.length === 0) {
      alert("No blank Shopify IID rows to export.");
      return;
    }

    const headers = columns.map(c => c.header).join(",");
    const csvContent = [
      headers,
      ...blankRows.map(row => 
        columns.map(c => `"${row[c.accessorKey] ?? ""}"`).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "blank_shopify_iid_inventory.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateShopifyInventory = async () => {
    if (!confirm("Are you sure you want to update Shopify inventory?")) return;

    setUpdating(true);
    setUpdateStatus(null);

    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inventoryData: data }),
      });

      const result = await response.json();

      if (!response.ok && !result.details) {
        setUpdateStatus({
          type: "error",
          message: result.error || "Failed to update inventory",
          details: result.details,
        });
      } else {
        setUpdateStatus({
          type: result.error ? "warning" : "success",
          message: result.message || result.error,
          updatedCount: result.updatedCount,
          failedCount: result.failedCount,
          totalAttempted: result.totalAttempted,
          errors: result.details && Array.isArray(result.details) ? result.details : null
        });
      }
    } catch (err) {
      setUpdateStatus({
        type: "error",
        message: "Network error while updating inventory",
        details: err.message,
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex flex-col gap-4 animate-pulse">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded"></div>
            <div className="flex gap-4">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-40 bg-gray-200 rounded-md"></div>
          </div>
        </div>
        
        <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {[...Array(10)].map((_, i) => (
                  <th key={i} className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(10)].map((_, i) => (
                <tr key={i} className="bg-white border-b">
                  {[...Array(10)].map((_, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-4 bg-gray-100 rounded"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inventory Update</h1>
          <div className="flex gap-4 mt-1 text-sm text-gray-600">
            <span>Total Items: <span className="font-semibold text-gray-900">{totalCount}</span></span>
            <span>Blank Shopify IID: <span className="font-semibold text-red-600">{blankCount}</span></span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleUpdateShopifyInventory}
            disabled={updating}
            className={`px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2`}
          >
            {updating ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              "Update Shopify Inventory"
            )}
          </button>

          <button
            onClick={() => setShowOnlyBlankIID(!showOnlyBlankIID)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
              showOnlyBlankIID 
                ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100" 
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {showOnlyBlankIID ? "Show All Data" : "Show Blank Shopify IID"}
          </button>

          {showOnlyBlankIID && (
            <button
              onClick={handleExportBlank}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              Export Blank to CSV
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input
            type="text"
            className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
            placeholder="Search all columns..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
      </div>
      
      <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-200">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 font-semibold whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                  No inventory items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <button
            className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">
            Page <span className="font-bold">{table.getState().pagination.pageIndex + 1}</span> of{" "}
            <span className="font-bold">{table.getPageCount()}</span>
          </span>
          <select
            className="border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>

      {updateStatus && (
        <div className={`mt-4 p-4 rounded-lg border ${
          updateStatus.type === "success" 
            ? "bg-green-50 border-green-200 text-green-800" 
            : updateStatus.type === "warning"
            ? "bg-yellow-50 border-yellow-200 text-yellow-800"
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          <div className="flex items-center gap-2 font-bold mb-1 text-lg">
            {updateStatus.type === "success" ? (
              <svg className="h-6 w-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : updateStatus.type === "warning" ? (
              <svg className="h-6 w-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {updateStatus.message}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 mb-4">
            <div className="bg-white bg-opacity-50 p-3 rounded shadow-sm">
              <p className="text-xs uppercase font-semibold text-gray-500">Attempted</p>
              <p className="text-xl font-bold">{updateStatus.totalAttempted || 0}</p>
            </div>
            <div className="bg-green-100 bg-opacity-50 p-3 rounded shadow-sm">
              <p className="text-xs uppercase font-semibold text-green-600">Successfully Updated</p>
              <p className="text-xl font-bold text-green-700">{updateStatus.updatedCount || 0}</p>
            </div>
            <div className="bg-red-100 bg-opacity-50 p-3 rounded shadow-sm">
              <p className="text-xs uppercase font-semibold text-red-600">Failed / Errors</p>
              <p className="text-xl font-bold text-red-700">{updateStatus.failedCount || 0}</p>
            </div>
          </div>

          {updateStatus.errors && (
            <ErrorTable errorData={updateStatus.errors} />
          )}

          {updateStatus.details && !updateStatus.errors && (
            <div className="mt-2 text-xs overflow-auto max-h-40 bg-white bg-opacity-50 p-2 rounded">
              <pre>{JSON.stringify(updateStatus.details, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
