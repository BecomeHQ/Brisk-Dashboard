"use client";
import React, { useState, useEffect } from "react";
import { LeaveData, UserData } from "./types";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [leaveRequests, setLeaveRequests] = useState<LeaveData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("permission");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (activeTab === "permission") {
      fetchLeaves();
    } else {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/api/users"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

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

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-30 transition-transform duration-300 ease-in-out transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 w-64 lg:w-64`}
      >
        <div className="p-4">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">B</span>
            </div>
            <span className="text-xl font-semibold">Brisk</span>
          </div>

          <nav className="space-y-6">
            <div className="text-xs font-semibold text-gray-400 pl-4">MAIN</div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer bg-indigo-50 text-indigo-600">
              <span>📅</span>
              <span>Attendance</span>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden text-gray-500 hover:text-gray-900"
                onClick={() => setIsSidebarOpen(true)}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900">
                Employee Schedule & Attendance
              </h1>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 mt-4 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab("permission")}
                className={`text-sm sm:text-base pb-2 font-medium whitespace-nowrap ${
                  activeTab === "permission"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500"
                }`}
              >
                Permission Request{" "}
                <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                  {leaveRequests.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("balances")}
                className={`text-sm sm:text-base pb-2 font-medium whitespace-nowrap ${
                  activeTab === "balances"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500"
                }`}
              >
                Leave Balances
              </button>
              <button className="text-sm sm:text-base pb-2 font-medium text-gray-500 whitespace-nowrap">
                Work schedule
              </button>
              <button className="text-sm sm:text-base pb-2 font-medium text-gray-500 whitespace-nowrap">
                Activity log{" "}
                <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                  2
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder={`Search ${
                  activeTab === "permission" ? "employee" : "user"
                }`}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
            {activeTab === "permission" && (
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
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
            )}
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                Loading{" "}
                {activeTab === "permission" ? "leave requests" : "users"}...
              </div>
            ) : activeTab === "permission" ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="px-4 py-3">Employee</th>
                      <th className="px-4 py-3">Date Range</th>
                      <th className="px-4 py-3">Duration</th>
                      <th className="px-4 py-3">Permission details</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredRequests.map((request) => (
                      <tr key={request._id} className="text-sm">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-base">
                              👤
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {request.username}
                              </div>
                              <div className="text-xs text-gray-500">
                                {request.user}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-900">
                          {formatDateRange(request.dates)}
                        </td>
                        <td className="px-4 py-3 text-gray-900">
                          {request.leaveDay[0]}
                        </td>
                        <td className="px-4 py-3 text-gray-900">
                          {request.leaveType}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 text-sm font-medium ${
                              request.status === "Pending"
                                ? "text-yellow-600"
                                : request.status === "Approved"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            • {request.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No users found
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-4">Employee</th>
                        <th className="px-6 py-4">Leave Type</th>
                        <th className="px-6 py-4">Current Balance</th>
                        <th className="px-6 py-4">Remaining</th>
                        <th className="px-6 py-4">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <>
                          <tr key={`${user._id}-sick`} className="text-base">
                            <td className="px-6 py-4" rowSpan={11}>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                                  👤
                                </div>
                                <div>
                                  <div className="font-medium text-lg text-gray-900">
                                    {user.username}
                                  </div>
                                  <div className="text-base text-gray-500">
                                    {user.slackId}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              Sick Leave
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.currentBalances.sickLeave}
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.remainingLeaves.sickLeave}
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.totalLeaves.sickLeave}
                            </td>
                          </tr>
                          <tr key={`${user._id}-casual`} className="text-base">
                            <td className="px-6 py-4 text-base text-gray-900">
                              Casual Leave
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.currentBalances.casualLeave}
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.remainingLeaves.casualLeave}
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.totalLeaves.casualLeave}
                            </td>
                          </tr>
                          <tr key={`${user._id}-burnout`} className="text-base">
                            <td className="px-6 py-4 text-base text-gray-900">
                              Burnout
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.currentBalances.burnout}
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.remainingLeaves.burnout}
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.totalLeaves.burnout}
                            </td>
                          </tr>
                          <tr
                            key={`${user._id}-mensural`}
                            className="text-base"
                          >
                            <td className="px-6 py-4 text-base text-gray-900">
                              Mensural Leaves
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.currentBalances.mensuralLeaves}
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.remainingLeaves.mensuralLeaves}
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.totalLeaves.mensuralLeaves}
                            </td>
                          </tr>
                          <tr key={`${user._id}-unpaid`} className="text-base">
                            <td className="px-6 py-4 text-base text-gray-900">
                              Unpaid Leave
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.currentBalances.unpaidLeave}
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.remainingLeaves.unpaidLeave}
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.totalLeaves.unpaidLeave}
                            </td>
                          </tr>
                          <tr
                            key={`${user._id}-internship`}
                            className="text-base"
                          >
                            <td className="px-6 py-4 text-base text-gray-900">
                              Internship Leave
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.currentBalances.internshipLeave}
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.remainingLeaves.internshipLeave}
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.totalLeaves.internshipLeave}
                            </td>
                          </tr>
                          <tr key={`${user._id}-wfh`} className="text-base">
                            <td className="px-6 py-4 text-base text-gray-900">
                              WFH Leave
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.currentBalances.wfhLeave}
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.remainingLeaves.wfhLeave}
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.totalLeaves.wfhLeave}
                            </td>
                          </tr>
                          <tr
                            key={`${user._id}-bereavement`}
                            className="text-base"
                          >
                            <td className="px-6 py-4 text-base text-gray-900">
                              Bereavement Leave
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.currentBalances.bereavementLeave}
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.remainingLeaves.bereavementLeave}
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.totalLeaves.bereavementLeave}
                            </td>
                          </tr>
                          <tr
                            key={`${user._id}-maternity`}
                            className="text-base"
                          >
                            <td className="px-6 py-4 text-base text-gray-900">
                              Maternity Leave
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.currentBalances.maternityLeave}
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.remainingLeaves.maternityLeave}
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.totalLeaves.maternityLeave}
                            </td>
                          </tr>
                          <tr
                            key={`${user._id}-paternity`}
                            className="text-base"
                          >
                            <td className="px-6 py-4 text-base text-gray-900">
                              Paternity Leave
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.currentBalances.paternityLeave}
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.remainingLeaves.paternityLeave}
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.totalLeaves.paternityLeave}
                            </td>
                          </tr>
                          <tr
                            key={`${user._id}-restricted`}
                            className="text-base"
                          >
                            <td className="px-6 py-4 text-base text-gray-900">
                              Restricted Holiday
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.currentBalances.restrictedHoliday}
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.remainingLeaves.restrictedHoliday}
                            </td>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {user.totalLeaves.restrictedHoliday}
                            </td>
                          </tr>
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden">
                  {filteredUsers.map((user) => (
                    <div
                      key={user._id}
                      className="p-4 border-b last:border-b-0"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                          👤
                        </div>
                        <div>
                          <div className="font-medium text-lg text-gray-900">
                            {user.username}
                          </div>
                          <div className="text-base text-gray-500">
                            {user.slackId}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-500">
                              Sick Leave
                            </div>
                            <div className="text-lg font-medium">
                              {user.currentBalances.sickLeave}
                            </div>
                            <div className="text-xs text-gray-500">
                              Remaining: {user.remainingLeaves.sickLeave}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-500">
                              Casual Leave
                            </div>
                            <div className="text-lg font-medium">
                              {user.currentBalances.casualLeave}
                            </div>
                            <div className="text-xs text-gray-500">
                              Remaining: {user.remainingLeaves.casualLeave}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-500">Burnout</div>
                            <div className="text-lg font-medium">
                              {user.currentBalances.burnout}
                            </div>
                            <div className="text-xs text-gray-500">
                              Remaining: {user.remainingLeaves.burnout}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-500">
                              Mensural Leaves
                            </div>
                            <div className="text-lg font-medium">
                              {user.currentBalances.mensuralLeaves}
                            </div>
                            <div className="text-xs text-gray-500">
                              Remaining: {user.remainingLeaves.mensuralLeaves}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-500">
                              Unpaid Leave
                            </div>
                            <div className="text-lg font-medium">
                              {user.currentBalances.unpaidLeave}
                            </div>
                            <div className="text-xs text-gray-500">
                              Remaining: {user.remainingLeaves.unpaidLeave}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-500">
                              Internship Leave
                            </div>
                            <div className="text-lg font-medium">
                              {user.currentBalances.internshipLeave}
                            </div>
                            <div className="text-xs text-gray-500">
                              Remaining: {user.remainingLeaves.internshipLeave}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-500">
                              WFH Leave
                            </div>
                            <div className="text-lg font-medium">
                              {user.currentBalances.wfhLeave}
                            </div>
                            <div className="text-xs text-gray-500">
                              Remaining: {user.remainingLeaves.wfhLeave}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-500">
                              Bereavement Leave
                            </div>
                            <div className="text-lg font-medium">
                              {user.currentBalances.bereavementLeave}
                            </div>
                            <div className="text-xs text-gray-500">
                              Remaining: {user.remainingLeaves.bereavementLeave}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-500">
                              Maternity Leave
                            </div>
                            <div className="text-lg font-medium">
                              {user.currentBalances.maternityLeave}
                            </div>
                            <div className="text-xs text-gray-500">
                              Remaining: {user.remainingLeaves.maternityLeave}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-500">
                              Paternity Leave
                            </div>
                            <div className="text-lg font-medium">
                              {user.currentBalances.paternityLeave}
                            </div>
                            <div className="text-xs text-gray-500">
                              Remaining: {user.remainingLeaves.paternityLeave}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-500">
                              Restricted Holiday
                            </div>
                            <div className="text-lg font-medium">
                              {user.currentBalances.restrictedHoliday}
                            </div>
                            <div className="text-xs text-gray-500">
                              Remaining:{" "}
                              {user.remainingLeaves.restrictedHoliday}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
