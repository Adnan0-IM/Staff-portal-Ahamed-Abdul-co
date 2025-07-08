
import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportsContext';
import ReportDetails from '../components/ReportDetails';

interface Report {
  id: string;
  title: string;
  client: string;
  description: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  author: string;
  file: string;
  reviewDate?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser: user } = useAuth();
  const { reports } = useReports();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const userReports = reports.filter((report) => report.author === user?.id);
  
  const stats = {
    total: userReports.length,
    pending: userReports.filter((r) => r.status === 'pending').length,
    approved: userReports.filter((r) => r.status === 'approved').length,
    rejected: userReports.filter((r) => r.status === 'rejected').length,
  };

  const recentReports = userReports
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const handleDownload = useCallback(async (id: string, fileUrl: string) => {
    setDownloadingId(id);
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
    } finally {
      setDownloadingId(null);
    }
  }, []);

  // Calculate the next deadline
  const today = new Date();
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysUntilEndOfMonth = Math.ceil((lastDayOfMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <>
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

      <section className="text-white text-left relative mb-6">
        <div className="backdrop-blur-[6px] bg-[navy] rounded-lg p-8 text-center shadow-lg">
          <h1 className="text-2xl font-bold mb-4">Welcome, {user?.name}</h1>
          <p className="mb-4">
            Please ensure all uploaded reports are properly reviewed and
            approved by the managing partners or directors before submission
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/staffportal/reports')}
              className="bg-white text-[#052659] px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
              Submit New Report
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Personal Statistics Card */}
        <div className="bg-white backdrop-blur-[1px] shadow-lg rounded-lg p-6">
          <h3 className="text-[#052659] font-bold text-xl mb-2">My Report Statistics</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Reports</span>
              <span className="text-[#052659] font-bold">{stats.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending</span>
              <span className="text-orange-500 font-bold">{stats.pending}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Approved</span>
              <span className="text-green-500 font-bold">{stats.approved}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Rejected</span>
              <span className="text-red-500 font-bold">{stats.rejected}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity - Only My Reports */}
        <div className="bg-white backdrop-blur-[1px] shadow-lg rounded-lg p-6">
          <h3 className="text-[#052659] font-bold text-xl mb-2">Recent Activity</h3>
          <div className="space-y-3">
            {recentReports.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent reports</p>
            ) : (
              recentReports.map(report => (
                <div key={report.id} className="border-b pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="text-sm text-left"
                      >
                        <span className="text-[navy] font-semibold hover:text-[#0a5fde]">{report.title}</span>
                        <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${report.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          report.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                          {report.status}
                        </span>
                      </button>
                      <p className="text-xs text-gray-500">{new Date(report.date).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => handleDownload(report.id, report.file)}
                      disabled={downloadingId === report.id}
                      className="text-[#052659] hover:text-[#0a5fde] disabled:opacity-50 text-sm"
                    >
                      {downloadingId === report.id ? 'Downloading...' : 'Download'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Deadlines */}
        <div className="bg-white backdrop-blur-[1px] shadow-lg rounded-lg p-6">
          <h3 className="text-[#052659] font-bold text-xl mb-2">Upcoming Deadlines</h3>
          <div className="space-y-2">
            <div className="border-l-4 border-[navy] pl-2">
              <p className="font-semibold">Monthly Reports Due</p>
              <p className="text-sm text-gray-500">
                {daysUntilEndOfMonth === 0 
                  ? "Due today!"
                  : `Due in ${daysUntilEndOfMonth} days`}
              </p>
              {daysUntilEndOfMonth <= 5 && (
                <p className="text-sm text-orange-500 mt-1">Approaching deadline!</p>
              )}
            </div>
            {stats.pending > 0 && (
              <div className="border-l-4 border-orange-500 pl-2 mt-4">
                <p className="font-semibold">Pending Reviews</p>
                <p className="text-sm text-gray-500">
                  You have {stats.pending} report{stats.pending !== 1 ? 's' : ''} pending review
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Reports Table */}
      {/* <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="flex flex-col gap-4 sm:flex-row justify-between items-center mb-4">
          <h3 className="text-[navy] font-bold text-xl">My Pending Reports</h3>
          <Link
            to="/staffportal/reports"
            className="bg-[#052659] text-white px-4 py-2 rounded hover:bg-[#0a5fde] transition-colors flex items-center gap-2 text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
            View All Reports
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr className=''>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submission Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentReports.filter(report => report.status === 'pending').map(report => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{report.title}</div>
                      <div className="text-sm text-gray-500">{report.description.substring(0, 50)}...</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.client}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(report.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDownload(report.id, report.file)}
                      disabled={downloadingId === report.id}
                      className="text-[#052659] hover:text-[#0a5fde] disabled:opacity-50 mr-4"
                    >
                      {downloadingId === report.id ? 'Downloading...' : 'Download'}
                    </button>
                    <button
                     onClick={() => setSelectedReport(report)}
                      className="text-[#052659] hover:text-[#0a5fde]"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {recentReports.filter(report => report.status === 'pending').length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No pending reports
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div> */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
    <h3 className="text-[navy] font-bold text-xl">My Pending Reports</h3>
    <Link
      to="/staffportal/reports"
      className="bg-[#052659] text-white px-4 py-2 rounded hover:bg-[#0a5fde] transition-colors flex items-center gap-2 text-sm"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="12" y1="18" x2="12" y2="12"></line>
        <line x1="9" y1="15" x2="15" y2="15"></line>
      </svg>
      View All Reports
    </Link>
  </div>
  
  {/* Desktop Table - hidden on mobile */}
  <div className="overflow-x-auto hidden sm:block">
    <table className="min-w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submission Date</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {recentReports.filter(report => report.status === 'pending').map(report => (
          <tr key={report.id}>
            <td className="px-6 py-4 whitespace-nowrap">
              <div>
                <div className="text-sm font-medium text-gray-900">{report.title}</div>
                <div className="text-sm text-gray-500">{report.description.substring(0, 50)}...</div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.client}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {new Date(report.date).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                onClick={() => handleDownload(report.id, report.file)}
                disabled={downloadingId === report.id}
                className="text-[#052659] hover:text-[#0a5fde] disabled:opacity-50 mr-4"
              >
                {downloadingId === report.id ? 'Downloading...' : 'Download'}
              </button>
              <button
                onClick={() => setSelectedReport(report)}
                className="text-[#052659] hover:text-[#0a5fde]"
              >
                View Details
              </button>
            </td>
          </tr>
        ))}
        {recentReports.filter(report => report.status === 'pending').length === 0 && (
          <tr>
            <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
              No pending reports
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
  
  {/* Mobile Card Layout - visible only on mobile */}
  <div className="sm:hidden space-y-4">
    {recentReports.filter(report => report.status === 'pending').map(report => (
      <div key={report.id} className="bg-white border rounded-lg shadow-sm p-4">
        <div className="mb-2">
          <h4 className="font-medium text-gray-900">{report.title}</h4>
          <p className="text-sm text-gray-500">{report.description.substring(0, 50)}...</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div>
            <span className="text-gray-500 block">Client:</span>
            <span className="font-medium">{report.client}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Submission Date:</span>
            <span className="font-medium">{new Date(report.date).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex justify-between pt-2 border-t">
          <button
            onClick={() => handleDownload(report.id, report.file)}
            disabled={downloadingId === report.id}
            className="text-[#052659] hover:text-[#0a5fde] disabled:opacity-50 text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            {downloadingId === report.id ? 'Downloading...' : 'Download'}
          </button>
          <button
            onClick={() => setSelectedReport(report)}
            className="text-[#052659] hover:text-[#0a5fde] text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            View Details
          </button>
        </div>
      </div>
    ))}
    
    {recentReports.filter(report => report.status === 'pending').length === 0 && (
      <div className="text-center text-gray-500 py-4">
        No pending reports
      </div>
    )}
  </div>
</div>
    </>
  );
};

export default Dashboard;