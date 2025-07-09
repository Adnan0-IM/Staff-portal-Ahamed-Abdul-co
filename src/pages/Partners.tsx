import { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useReports } from "../context/ReportsContext";
import type { Report } from "../context/ReportsContextDef";
import { useToast } from "../components/ToastContext";
import ReportDetails from "../components/ReportDetails";

const Partners = () => {
  const { currentUser, staffList = [], isAdmin } = useAuth() || {};
  const reportsContext = useReports();
  const { showToast } = useToast() || { showToast: () => {} };

  const reports = useMemo(
    () => reportsContext?.reports || [],
    [reportsContext?.reports]
  );
  const approveReport = reportsContext?.approveReport || (() => {});
  const rejectReport = reportsContext?.rejectReport || (() => {});
  const addComment = reportsContext?.addComment || (() => Promise.resolve());

  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>(
    {}
  );
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [reportSearch, setReportSearch] = useState("");
  const [reportFilter, setReportFilter] = useState("all"); // 'all' | 'today' | 'week'
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Filter and search reports
  const filteredReports = useMemo(() => {
    return reports.filter((r: Report) => {
      // For admins, show all reports. For partners, only show their assigned reports
      const isAssignedOrAdmin = isAdmin || r.assignedTo === currentUser?.id;
      if (!isAssignedOrAdmin) return false;

      const matchesSearch =
        r.title.toLowerCase().includes(reportSearch.toLowerCase()) ||
        r.author.toLowerCase().includes(reportSearch.toLowerCase()) ||
        r.client.toLowerCase().includes(reportSearch.toLowerCase());

      if (!matchesSearch) return false;

      const reportDate = new Date(r.date);
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      switch (reportFilter) {
        case "today":
          return reportDate.toDateString() === today.toDateString();
        case "week":
          return reportDate >= weekAgo;
        default:
          return true;
      }
    });
  }, [reports, reportSearch, reportFilter, currentUser?.id, isAdmin]);

  // Only show pending reports
  const pendingReports = filteredReports.filter(
    (r: Report) => r.status === "pending"
  );

  // Calculate average review time
  const avgReviewTime = useMemo(() => {
    const completedReports = reports.filter(
      (r: Report) => r.status !== "pending"
    );
    if (completedReports.length === 0) return "N/A";

    const totalTime = completedReports.reduce((acc: number, report: Report) => {
      const submitDate = new Date(report.date);
      const reviewDate = new Date(report.reviewDate || report.date); // fallback to submission date if no review date
      return acc + (reviewDate.getTime() - submitDate.getTime());
    }, 0);

    const avgTimeInHours = totalTime / (completedReports.length * 3600000); // convert to hours

    if (avgTimeInHours < 24) {
      return `${Math.round(avgTimeInHours)}h`;
    } else {
      return `${Math.round(avgTimeInHours / 24)}d`;
    }
  }, [reports]);

  const handleApprove = (reportId: string) => {
    try {
      const report = reports.find((r) => r.id === reportId);
      if (!report) {
        showToast("Report not found.", "error");
        return;
      }

      approveReport(reportId);
      showToast(`Report "${report.title}" approved successfully!`, "success");
    } catch (error) {
      console.error("Error approving report:", error);
      showToast("Failed to approve report. Please try again.", "error");
    }
  };

  const handleReject = (reportId: string) => {
    try {
      const report = reports.find((r) => r.id === reportId);
      if (!report) {
        showToast("Report not found.", "error");
        return;
      }

      rejectReport(reportId);
      showToast(`Report "${report.title}" rejected.`, "info");
    } catch (error) {
      console.error("Error rejecting report:", error);
      showToast("Failed to reject report. Please try again.", "error");
    }
  };

  const handleCommentChange = (id: string, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddComment = async (id: string) => {
    try {
      const comment = commentInputs[id]?.trim();
      if (!comment) {
        showToast("Please enter a comment.", "error");
        return;
      }

      await addComment({
        reportId: id,
        comment,
        timestamp: new Date().toISOString(),
        author: currentUser?.name || "Managing Partner",
      });

      setCommentInputs((prev) => ({ ...prev, [id]: "" }));
      showToast("Comment added successfully.", "success");
    } catch (error) {
      console.error("Error adding comment:", error);
      showToast("Failed to add comment. Please try again.", "error");
    }
  };

  const handleDownload = async (id: string, fileUrl: string) => {
    setDownloadingId(id);
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Failed to fetch file");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast("Download started successfully!", "success");
    } catch (error) {
      console.error("Error downloading file:", error);
      showToast("Failed to download file. Please try again.", "error");
    } finally {
      setDownloadingId(null);
    }
  };

  // Dynamic statistics
  const pendingCount = reports.filter(
    (r: Report) =>
      r.status === "pending" && (isAdmin || r.assignedTo === currentUser?.id)
  ).length;
  const today = new Date().toISOString().split("T")[0];
  const approvedToday = reports.filter(
    (r: Report) =>
      r.status === "approved" &&
      (isAdmin || r.assignedTo === currentUser?.id) &&
      new Date(r.reviewDate || "").toISOString().split("T")[0] === today
  ).length;

  const getStaffNameById = (id: string) => {
    const staff = staffList.find((s) => s.id === id);
    return staff?.name || id;
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50">
      <h1 className="text-3xl font-bold text-[#052659] mb-8">
        {isAdmin ? "Reports Management" : "Managing Partner Dashboard"}
      </h1>

      <div className="backdrop-blur-[1px] bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-[#052659] mb-4">
          Pending Reviews
        </h2>

        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search reports..."
            value={reportSearch}
            onChange={(e) => setReportSearch(e.target.value)}
            className="p-2 border rounded flex-grow"
          />
          <select
            value={reportFilter}
            onChange={(e) => setReportFilter(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
          </select>
        </div>

        <div className="space-y-4">
          {pendingReports.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No pending reports found
            </p>
          ) : (
            pendingReports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-lg font-semibold">{report.title}</h4>
                    <p className="text-sm text-gray-500">
                      By {getStaffNameById(report.author)} •{" "}
                      {new Date(report.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Client: {report.client}
                    </p>
                  </div>
                  <div className="flex gap-2 items-start">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      <span>View Details</span>
                    </button>
                    <button
                      onClick={() => handleDownload(report.id, report.file)}
                      disabled={downloadingId === report.id}
                      className="text-[#052659] hover:text-[#0a5fde] px-3 py-1 rounded flex items-center gap-1 disabled:opacity-50"
                    >
                      {downloadingId === report.id ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                          <span>Download</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleApprove(report.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(report.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700">{report.description}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={commentInputs[report.id] || ""}
                      onChange={(e) =>
                        handleCommentChange(report.id, e.target.value)
                      }
                      placeholder="Add a comment..."
                      className="flex-1 p-2 border rounded"
                    />
                    <button
                      onClick={() => handleAddComment(report.id)}
                      className="bg-[#052659] text-white px-3 py-2 rounded hover:bg-[#0a5fde]"
                    >
                      Add Comment
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-[navy] mb-4">
            Report Statistics
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-blue-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Pending Reviews</p>
              <p className="text-2xl font-bold text-[navy]">{pendingCount}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Approved Today</p>
              <p className="text-2xl font-bold text-green-600">
                {approvedToday}
              </p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Avg. Review Time</p>
              <p className="text-2xl font-bold text-yellow-600">
                {avgReviewTime}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
          <h2 className="text-xl font-bold text-[navy] mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {reports
              .filter((r) => isAdmin || r.assignedTo === currentUser?.id)
              .sort(
                (a: Report, b: Report) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .slice(0, 5)
              .map((report: Report) => (
                <div
                  key={report.id}
                  className={`border-l-4 pl-4 ${
                    report.status === "approved"
                      ? "border-green-500"
                      : report.status === "rejected"
                      ? "border-red-500"
                      : "border-[navy]"
                  }`}
                >
                  <p className="text-sm font-semibold">
                    {report.status === "pending"
                      ? `${getStaffNameById(report.author)} uploaded ${
                          report.title
                        }`
                      : `${report.title} was ${report.status}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(report.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      hour: "numeric",
                      minute: "numeric",
                    })}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="max-w-3xl w-full">
            <ReportDetails
              report={selectedReport}
              onDownload={handleDownload}
              downloadingId={downloadingId}
              onClose={() => setSelectedReport(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Partners;
