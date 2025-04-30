"use client";
import React, { useState, useEffect } from "react";
import { LeaveData } from "./types";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [leaveRequests, setLeaveRequests] = useState<LeaveData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/api/leaves"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch leaves");
      }
      const data = await response.json();
      setLeaveRequests(data);
    } catch (error) {
      console.error("Error fetching leaves:", error);
      setError("Failed to load leave requests. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | Date) => {
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString();
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatDateRange = (dates: (string | Date)[]) => {
    if (!dates || dates.length === 0) return "No date";
    if (dates.length === 1) return formatDate(dates[0]);

    return `${formatDate(dates[0])} - ${formatDate(dates[dates.length - 1])}`;
  };

  const handleExportCSV = () => {
    // Convert leave requests to CSV format
    const csvContent = [
      ["Employee", "Date", "Reason", "Type", "Status"],
      ...leaveRequests.map((request) => [
        request.username,
        formatDate(request.dates[0]),
        request.reason,
        request.leaveType,
        request.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leave_requests.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const filteredRequests = leaveRequests.filter(
    (request) =>
      request.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sidebarItems = [{ name: "Attendance", icon: "📅" }];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">B</span>
            </div>
            <span className="text-xl font-semibold">Brisk</span>
          </div>

          <div className="space-y-6">
            <div className="text-xs font-semibold text-gray-400 pl-4">MAIN</div>
            {sidebarItems.map((item) => (
              <div
                key={item.name}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer ${
                  item.name === "Attendance"
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="px-8 py-6">
            <h1 className="text-3xl font-semibold text-gray-900">
              Employee Schedule & Attendance
            </h1>

            {/* Tabs */}
            <div className="flex items-center gap-8 mt-6">
              <button className="text-lg text-indigo-600 border-b-2 border-indigo-600 pb-4 font-medium">
                Permission Request{" "}
                <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-sm">
                  {leaveRequests.length}
                </span>
              </button>
              <button className="text-gray-500 pb-4 font-medium">
                Work schedule
              </button>
              <button className="text-gray-500 pb-4 font-medium">
                Activity log{" "}
                <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                  2
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search employee"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <span>Export CSV</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Loading leave requests...
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No leave requests found
              </div>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">
                      Date Range
                      <svg
                        className="w-4 h-4 inline-block ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </th>
                    <th className="px-6 py-4">
                      Duration
                      <svg
                        className="w-4 h-4 inline-block ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </th>
                    <th className="px-6 py-4">Permission details</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request._id} className="text-base">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                            👤
                          </div>
                          <div>
                            <div className="font-medium text-lg text-gray-900">
                              {request.username}
                            </div>
                            <div className="text-base text-gray-500">
                              {request.user}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-base text-gray-900">
                        {formatDateRange(request.dates)}
                      </td>
                      <td className="px-6 py-4 text-base text-gray-900">
                        {request.leaveDay[0]}
                      </td>
                      <td className="px-6 py-4 text-base text-gray-900">
                        {request.leaveType}
                      </td>
                      <td className="px-6 py-4">
                        {request.status === "Pending" ? (
                          <span className="text-base text-yellow-600 font-medium flex items-center gap-1">
                            • Pending
                          </span>
                        ) : request.status === "Approved" ? (
                          <span className="text-base text-green-600 font-medium flex items-center gap-1">
                            • Approved
                          </span>
                        ) : (
                          <span className="text-base text-red-600 font-medium flex items-center gap-1">
                            • Rejected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
