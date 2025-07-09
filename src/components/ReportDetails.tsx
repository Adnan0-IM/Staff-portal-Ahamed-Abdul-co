import React from "react";

interface Comment {
  id: string;
  reportId: string;
  comment: string;
  timestamp: string;
  author: string;
}

interface Report {
  id: string;
  title: string;
  client: string;
  description: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  author: string;
  file: string;
  reviewDate?: string;
  comments?: Comment[];
}

interface ReportDetailsProps {
  report: Report;
  onDownload: (id: string, fileUrl: string) => Promise<void>;
  downloadingId: string | null;
  onClose?: () => void;
}

const ReportDetails: React.FC<ReportDetailsProps> = ({
  report,
  onDownload,
  downloadingId,
  onClose,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#052659]">{report.title}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => onClose?.()}
            className="text-gray-600 hover:text-gray-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Client</h3>
            <p className="mt-1 text-lg text-gray-900">{report.client}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Submission Date
            </h3>
            <p className="mt-1 text-lg text-gray-900">
              {new Date(report.date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <span
              className={`mt-1 inline-flex px-3 py-1 text-sm font-semibold rounded-full
              ${
                report.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : report.status === "rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="mt-1 text-gray-900 whitespace-pre-wrap">
              {report.description}
            </p>
          </div>
          {report.reviewDate && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Review Date</h3>
              <p className="mt-1 text-lg text-gray-900">
                {new Date(report.reviewDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      {report.comments && report.comments.length > 0 && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Comments</h3>
          <div className="space-y-4">
            {report.comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-gray-900">
                    {comment.author}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                  {comment.comment}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-end gap-4">
        <button
          onClick={() => onClose?.()}
          className="px-4 py-2 text-[#052659] hover:text-[#0a5fde] transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => onDownload(report.id, report.file)}
          disabled={downloadingId === report.id}
          className="bg-[#052659] text-white px-6 py-2 rounded-lg hover:bg-[#0a5fde] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {downloadingId === report.id ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Downloading...
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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
              Download Report
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReportDetails;
