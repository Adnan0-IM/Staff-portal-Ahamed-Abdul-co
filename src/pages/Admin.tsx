import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportsContext';
import type { Report } from '../context/ReportsContextDef'
import { useToast } from '../components/ToastContext'
import ReportDetails from '../components/ReportDetails';



const Admin = () => {
  const { staffList = [], assignStaff, removeStaff, currentUser: user } = useAuth() || {};
  const reportsContext = useReports();
  const { showToast } = useToast() || { showToast: () => {} };

  const reports = useMemo(() => reportsContext?.reports || [], [reportsContext?.reports]);
  const approveReport = reportsContext?.approveReport;
  const rejectReport = reportsContext?.rejectReport;
  const addComment = reportsContext?.addComment;
  const addReport = reportsContext?.addReport;

  // Tab system for unified admin controls
  const [activeTab, setActiveTab] = useState('dashboard');

  // Staff management state
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    role: ''
  });
  
  // Reports management state
  const [commentInputs, setCommentInputs] = useState<{[key:string]: string}>({});
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showAddReportModal, setShowAddReportModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Add Report Form
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    description: '',
    file: null as File | null,
    assignedTo: '', // ID of managing partner to review the report
  });
  
  // Search and filters
  const [search, setSearch] = useState('');
  const [reportSearch, setReportSearch] = useState('');
  const [reportFilter, setReportFilter] = useState('all'); // 'all' | 'today' | 'week'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [reportTimeframe, setReportTimeframe] = useState('month'); // 'week' | 'month' | 'year' | 'all'

  // Filter staff by search
  const filteredStaff = staffList.filter(staff =>
    staff.name.toLowerCase().includes(search.toLowerCase()) ||
    staff.email.toLowerCase().includes(search.toLowerCase()) ||
    staff.role.toLowerCase().includes(search.toLowerCase())
  );

  // Filter and search reports
  const filteredReports = useMemo(() => {
    return reports.filter((r: Report) => {
      const matchesSearch = 
        r.title.toLowerCase().includes(reportSearch.toLowerCase()) ||
        r.author.toLowerCase().includes(reportSearch.toLowerCase()) ||
        r.client.toLowerCase().includes(reportSearch.toLowerCase());
      
      if (!matchesSearch) return false;
      
      // Status filtering
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      
      const reportDate = new Date(r.date);
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
      
      // Time-based filtering (filter + timeframe combined)
      switch (reportFilter) {
        case 'today':
          return reportDate.toDateString() === today.toDateString();
        case 'week':
          return reportDate >= weekAgo;
        default:
          // Apply timeframe filtering when 'all' is selected for reportFilter
          switch (reportTimeframe) {
            case 'week':
              return reportDate >= weekAgo;
            case 'month':
              return reportDate >= monthAgo;
            case 'year':
              return reportDate >= yearAgo;
            default:
              return true;
          }
      }
    });
  }, [reports, reportSearch, reportFilter, statusFilter, reportTimeframe]);

  // Only show pending reports
  // Count of pending reports
  const pendingCount = reports.filter((r: Report) => r.status === 'pending').length;

  // Calculate average review time
  const avgReviewTime = useMemo(() => {
    const completedReports = reports.filter((r: Report) => r.status !== 'pending');
    if (completedReports.length === 0) return 'N/A';

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

  const handleNewStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation: prevent duplicate email
    if (staffList.some(staff => staff.email === newStaff.email)) {
      showToast('A staff member with this email already exists.', 'error');
      return;
    }
    if (!newStaff.name || !newStaff.email || !newStaff.role) {
      showToast('All fields are required.', 'error');
      return;
    }
    
    // Convert role to proper type
    const role = newStaff.role === 'Managing Partner' ? 'Managing Partner' : 
                  newStaff.role === 'Administrator' ? 'Administrator' : 'Staff';
                  
    assignStaff({
      name: newStaff.name,
      email: newStaff.email,
      role: role as "Administrator" | "Staff" | "Managing Partner"
    });
    
    setNewStaff({ name: '', email: '', role: '' });
    showToast('Staff added successfully!', 'success');
  };

  const handleStaffRemove = (id: string) => {
    if (window.confirm('Are you sure you want to remove this staff member?')) {
      removeStaff(id);
      showToast('Staff removed.', 'info');
    }
  };

  const handleApprove = (reportId: string) => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) {
        showToast('Report not found.', 'error');
        return;
      }

      if (approveReport) {
        approveReport(reportId);
        showToast(`Report "${report.title}" approved successfully!`, 'success');
      } else {
        showToast('Report approval function unavailable.', 'error');
      }
    } catch (error) {
      console.error('Error approving report:', error);
      showToast('Failed to approve report. Please try again.', 'error');
    }
  };

  const handleReject = (reportId: string) => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) {
        showToast('Report not found.', 'error');
        return;
      }

      if (rejectReport) {
        rejectReport(reportId);
        showToast(`Report "${report.title}" rejected.`, 'info');
      } else {
        showToast('Report rejection function unavailable.', 'error');
      }
    } catch (error) {
      console.error('Error rejecting report:', error);
      showToast('Failed to reject report. Please try again.', 'error');
    }
  };

  const handleCommentChange = (id: string, value: string) => {
    setCommentInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleAddComment = async (id: string) => {
    try {
      const comment = commentInputs[id]?.trim();
      if (!comment) {
        showToast('Please enter a comment.', 'error');
        return;
      }

      if (addComment) {
        await addComment({
          reportId: id,
          comment,
          timestamp: new Date().toISOString(),
          author: staffList.find(s => s.role === 'Administrator')?.name || 'Administrator'
        });
        
        setCommentInputs(prev => ({ ...prev, [id]: '' }));
        showToast('Comment added successfully.', 'success');
      } else {
        showToast('Comment function unavailable.', 'error');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      showToast('Failed to add comment. Please try again.', 'error');
    }
  };

  const handleDownload = async (id: string, fileUrl: string) => {
    setDownloadingId(id);
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Failed to fetch file');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Download started successfully!', 'success');
    } catch (error) {
      console.error('Error downloading file:', error);
      showToast('Failed to download file. Please try again.', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  // Dynamic statistics
  const today = new Date().toISOString().split('T')[0];
  const approvedToday = reports.filter((r: Report) => 
    r.status === 'approved' && 
    new Date(r.reviewDate || '').toISOString().split('T')[0] === today
  ).length;
  const totalStaff = staffList.length;

  const getStaffNameById = (id: string) => {
    const staff = staffList.find(s => s.id === id);
    return staff?.name || id;
  };
  
  // Add Report Modal handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData((prev) => ({ ...prev, file: e.target.files![0] }));
    }
  };

  const handleAddReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.file) {
      showToast('Please fill out all required fields including a file attachment.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const fileUrl = URL.createObjectURL(formData.file);
      
      if (addReport) {
        await addReport({
          title: formData.title,
          client: formData.client,
          description: formData.description,
          date: new Date().toISOString(),
          author: user.id,
          file: fileUrl,
          assignedTo: formData.assignedTo,
        });
        
        showToast('Report created successfully!', 'success');
        
        // Reset form
        setFormData({
          title: '',
          client: '',
          description: '',
          file: null,
          assignedTo: '',
        });
        
        // Close modal
        setShowAddReportModal(false);
      } else {
        showToast('Unable to create report. Report function unavailable.', 'error');
      }
    } catch (error) {
      console.error('Error creating report:', error);
      showToast('Failed to create report. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddReportClick = () => {
    // Initialize form data with default values to ensure clean form
    setFormData({
      title: '',
      client: '',
      description: '',
      file: null,
      assignedTo: '',
    });
    setShowAddReportModal(true);
  };

  const handleCloseAddReportModal = () => {
    setShowAddReportModal(false);
  };

  // Function to determine the badge color based on report status
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <>
      {/* Role information banner */}
      <div className="bg-blue-100 border-l-4 border-blue-400 p-4 mb-8 rounded-r-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              As an Administrator, you have full access to manage staff, reports, and analytics. Regular staff can only manage their own reports through the Reports page.
            </p>
          </div>
        </div>
      </div>
      
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
      
      {/* Add Report Modal */}
      {showAddReportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#052659]">Create New Report</h2>
                <button 
                  onClick={handleCloseAddReportModal}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label="Close modal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleAddReportSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1" htmlFor="title">Title</label>
                    <input
                      id="title"
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter a descriptive title for your report"
                      className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-[#052659] focus:ring-[#052659] px-4 py-3 text-gray-900 placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1" htmlFor="client">Client</label>
                    <input
                      id="client"
                      type="text"
                      name="client"
                      value={formData.client}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter the client or organization name"
                      className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-[#052659] focus:ring-[#052659] px-4 py-3 text-gray-900 placeholder-gray-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-900 mb-1" htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      placeholder="Provide a detailed description of the report, including key points and findings..."
                      className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-[#052659] focus:ring-[#052659] px-4 py-3 text-gray-900 placeholder-gray-500"
                      rows={4}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-900 mb-1" htmlFor="file">
                      Attachment
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border border-gray-300 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="space-y-2 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm justify-center">
                          <label htmlFor="file" className="relative cursor-pointer rounded-md font-semibold text-[#052659] hover:text-[#0a5fde] focus-within:outline-none">
                            <span>Upload a file</span>
                            <input
                              id="file"
                              type="file"
                              onChange={handleFileChange}
                              required
                              accept=".pdf,.doc,.docx"
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1 text-gray-700">or drag and drop</p>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">PDF, DOC up to 10MB</p>
                      </div>
                    </div>
                    {formData.file && (
                      <p className="mt-2 text-sm font-medium text-gray-900">
                        Selected file: <span className="text-[#052659]">{formData.file.name}</span>
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-900 mb-1" htmlFor="assignedTo">
                      Assign to Managing Partner
                    </label>
                    <select
                      id="assignedTo"
                      name="assignedTo"
                      value={formData.assignedTo}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-[#052659] focus:ring-[#052659] px-4 py-3 text-gray-900"
                    >
                      <option value="">Select a Managing Partner</option>
                      {staffList?.filter(staff => staff.role === 'Managing Partner').map(partner => (
                        <option key={partner.id} value={partner.id}>
                          {partner.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowAddReportModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#052659] text-white px-6 py-2 rounded-lg hover:bg-[#0a5fde] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        Create Report
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold text-[#052659] mb-8">Admin Control Panel</h1>
      
      {/* Top stats summary - Quick overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-100 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Staff Members</p>
          <p className="text-2xl font-bold text-[navy]">{totalStaff}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Reports</p>
          <p className="text-2xl font-bold text-green-600">{reports.length}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Pending Reviews</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Avg. Review Time</p>
          <p className="text-2xl font-bold text-purple-600">{avgReviewTime}</p>
        </div>
      </div>
      
      {/* Tab navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px grid grid-cols-2 sm:grid-cols-4 space-x-8">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`${activeTab === 'dashboard' 
              ? 'border-[#052659] text-[#052659]' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('staff')}
            className={`${activeTab === 'staff' 
              ? 'border-[#052659] text-[#052659]' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Staff Management
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`${activeTab === 'reports' 
              ? 'border-[#052659] text-[#052659]' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Reports Management
          </button>            <button 
            onClick={() => setActiveTab('analytics')}
            className={`${activeTab === 'analytics' 
              ? 'border-[#052659] text-[#052659]' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            type="button"
          >
            Analytics
          </button>
        </nav>
      </div>


{/* Dashboard Tab Content */}
{activeTab === 'dashboard' && (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Activity Summary */}
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:col-span-2">
      <h2 className="text-xl font-bold text-[#052659] mb-4">Recent Activity</h2>
      <div className="space-y-4 overflow-x-auto">
        {reports
          .sort((a: Report, b: Report) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 6)
          .map((report: Report) => (
            <div key={report.id} className={`border-l-4 pl-4 ${
              report.status === 'approved' ? 'border-green-500' :
              report.status === 'rejected' ? 'border-red-500' :
              'border-[navy]'
            }`}>
              <p className="text-sm font-semibold break-words">
                {report.status === 'pending' 
                  ? `${getStaffNameById(report.author)} uploaded ${report.title}`
                  : `${report.title} was ${report.status}`}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(report.date).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  hour: 'numeric',
                  minute: 'numeric'
                })}
              </p>
            </div>
          ))}
      </div>
    </div>

    {/* Quick Actions */}
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
      <h2 className="text-xl font-bold text-[#052659] mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
        <button
          onClick={() => setActiveTab('staff')}
          className="w-full bg-blue-50 hover:bg-blue-100 p-3 sm:p-4 rounded-lg text-left flex items-center gap-3"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 flex-shrink-0">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span>Manage Staff</span>
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className="w-full bg-green-50 hover:bg-green-100 p-3 sm:p-4 rounded-lg text-left flex items-center gap-3"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 flex-shrink-0">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span>Review Reports</span>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className="w-full bg-purple-50 hover:bg-purple-100 p-3 sm:p-4 rounded-lg text-left flex items-center gap-3"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600 flex-shrink-0">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          <span>View Analytics</span>
        </button>
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-[#052659] mb-2">Today's Overview</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="border-l-4 border-yellow-500 pl-4 py-2">
            <p className="text-sm font-medium">Pending Reports</p>
            <p className="text-xl font-bold">{pendingCount}</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4 py-2">
            <p className="text-sm font-medium">Approved Today</p>
            <p className="text-xl font-bold">{approvedToday}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{/* Staff Management Tab Content */}
{activeTab === 'staff' && (
  <div className="backdrop-blur-[1px] bg-white rounded-lg shadow-lg p-4 sm:p-6">
    <h2 className="text-xl sm:text-2xl font-bold text-[#052659] mb-4">Staff Management</h2>
    
    {/* Add New Staff Form */}
    <form onSubmit={handleNewStaffSubmit} className="mb-8 bg-[#f8fafc] p-4 sm:p-6 rounded-lg border border-gray-100 shadow-sm">
      <h3 className="text-lg font-semibold text-[#052659] mb-4">Add New Staff Member</h3>
      <div className="grid gap-4 sm:gap-6 md:grid-cols-3 mb-6">
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            value={newStaff.name}
            onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1 block w-full rounded-lg border-gray-200 bg-white px-3 py-2 sm:px-4 sm:py-3 text-gray-700 shadow-sm transition-all hover:border-gray-300 focus:border-[#052659] focus:ring-2 focus:ring-[#052659]/20"
            required
            placeholder="Enter staff member's name"
          />
        </div>
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            value={newStaff.email}
            onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
            className="mt-1 block w-full rounded-lg border-gray-200 bg-white px-3 py-2 sm:px-4 sm:py-3 text-gray-700 shadow-sm transition-all hover:border-gray-300 focus:border-[#052659] focus:ring-2 focus:ring-[#052659]/20"
            required
            placeholder="Enter staff member's email"
          />
        </div>
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
          <select
            value={newStaff.role}
            onChange={(e) => setNewStaff(prev => ({ ...prev, role: e.target.value }))}
            className="mt-1 block w-full rounded-lg border-gray-200 bg-white px-3 py-2 sm:px-4 sm:py-3 text-gray-700 shadow-sm transition-all hover:border-gray-300 focus:border-[#052659] focus:ring-2 focus:ring-[#052659]/20"
            required
          >
            <option value="">Select staff role</option>
            <option value="Staff">Staff</option>
            <option value="Managing Partner">Managing Partner</option>
            <option value="Administrator">Administrator</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-[#052659] hover:bg-[#0a5fde] text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-semibold shadow-sm hover:shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <line x1="19" y1="8" x2="19" y2="14"></line>
            <line x1="16" y1="11" x2="22" y2="11"></line>
          </svg>
          <span className="hidden sm:inline">Add Staff Member</span>
          <span className="sm:hidden">Add Staff</span>
        </button>
      </div>
    </form>

    {/* Staff List */}
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
        <h3 className="text-lg sm:text-xl font-semibold text-[navy]">Current Staff</h3>
        <input
          type="text"
          placeholder="Search staff..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="p-2 border rounded w-full sm:w-auto"
          aria-label="Search staff"
        />
      </div>
      
      {/* Table for larger screens */}
      <div className="hidden sm:block overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Added</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStaff.map(staff => (
              <tr key={staff.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${staff.role === 'Administrator' ? 'bg-purple-100 text-purple-800' : 
                      staff.role === 'Managing Partner' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'}`}>
                    {staff.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(staff.dateAssigned).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => handleStaffRemove(staff.id)}
                    className="text-red-600 hover:text-red-900"
                    aria-label={`Remove staff ${staff.name}`}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {filteredStaff.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No staff members found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Card view for mobile */}
      <div className="sm:hidden space-y-4">
        {filteredStaff.map(staff => (
          <div key={staff.id} className="bg-white border rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-gray-900">{staff.name}</h4>
                <p className="text-sm text-gray-500 mt-1">{staff.email}</p>
                <div className="flex items-center mt-2">
                  <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full 
                    ${staff.role === 'Administrator' ? 'bg-purple-100 text-purple-800' : 
                      staff.role === 'Managing Partner' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'}`}>
                    {staff.role}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    Added: {new Date(staff.dateAssigned).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleStaffRemove(staff.id)}
                className="text-red-600 hover:text-red-900 p-1"
                aria-label={`Remove staff ${staff.name}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        ))}
        {filteredStaff.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            No staff members found
          </div>
        )}
      </div>
    </div>
  </div>
)}

{/* Reports Management Tab Content */}
{activeTab === 'reports' && (
  <div>
    <div className="backdrop-blur-[1px] bg-white rounded-lg shadow-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[#052659]">Reports Management</h2>

        <button
          onClick={handleAddReportClick}
          className="bg-[#052659] text-white px-4 py-2 rounded-lg hover:bg-[#0a5fde] transition-colors flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span className="sm:block">Create New Report</span>
        </button>
      </div>
      
      <div className="mb-6 space-y-3">
        <input
          type="text"
          placeholder="Search reports..."
          value={reportSearch}
          onChange={e => setReportSearch(e.target.value)}
          className="p-2 border rounded w-full"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <select
            value={reportFilter}
            onChange={e => setReportFilter(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={reportTimeframe}
            onChange={e => setReportTimeframe(e.target.value)}
            className="p-2 border rounded col-span-2 sm:col-span-1"
          >
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No reports found matching your criteria</p>
        ) : (
          filteredReports.map(report => (
            <div key={report.id} className="border rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-lg font-semibold">{report.title}</h4>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">By {getStaffNameById(report.author)} • {new Date(report.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600 mt-1">Client: {report.client}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-2 sm:mt-0 w-full sm:w-auto">
                 <div className='flex justify-between gap-4'> <button
                    onClick={() => setSelectedReport(report)}
                    className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded border border-blue-200 w-full text-sm flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    View
                  </button>
                  <button
                    onClick={() => handleDownload(report.id, report.file)}
                    disabled={downloadingId === report.id}
                    className="text-[#052659] hover:text-[#0a5fde] px-3 py-1 rounded border border-blue-200 flex items-center gap-1 w-full disabled:opacity-50 text-sm"
                  >
                    {downloadingId === report.id ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="">Downloading...</span>
                      
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        <span className="">Download</span>
                       
                      </>
                    )}
                  </button></div>
                  {report.status === 'pending' && (
                    <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      <button
                        onClick={() => handleApprove(report.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 flex-1 sm:flex-none flex items-center justify-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleReject(report.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex-1 sm:flex-none flex items-center justify-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-700 text-sm line-clamp-2 sm:line-clamp-none">{report.description}</p>
              </div>

              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={commentInputs[report.id] || ''}
                    onChange={(e) => handleCommentChange(report.id, e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 p-2 border rounded"
                  />
                  <button
                    onClick={() => handleAddComment(report.id)}
                    className="bg-[#052659] text-white px-3 py-2 rounded hover:bg-[#0a5fde] whitespace-nowrap"
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
  </div>
)}

{/* Analytics Tab Content */}
{activeTab === 'analytics' && (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold text-[navy] mb-4">Report Statistics</h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-600">Total Reports</p>
          <p className="text-lg sm:text-2xl font-bold text-[navy]">{reports.length}</p>
        </div>
        <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-600">Pending Reviews</p>
          <p className="text-lg sm:text-2xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-600">Approved</p>
          <p className="text-lg sm:text-2xl font-bold text-green-600">
            {reports.filter((r: Report) => r.status === 'approved').length}
          </p>
        </div>
        <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-600">Rejected</p>
          <p className="text-lg sm:text-2xl font-bold text-red-600">
            {reports.filter((r: Report) => r.status === 'rejected').length}
          </p>
        </div>
        <div className="bg-indigo-50 p-3 sm:p-4 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-600">Avg. Review Time</p>
          <p className="text-lg sm:text-2xl font-bold text-indigo-600">{avgReviewTime}</p>
        </div>
        <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-600">Total Staff</p>
          <p className="text-lg sm:text-2xl font-bold text-purple-600">{totalStaff}</p>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg sm:text-xl font-semibold text-[#052659] mb-2">Staff Performance</h3>
        <div className="space-y-3 mt-4 overflow-x-auto">
          {staffList
            .filter(staff => staff.role === 'Staff')
            .map(staff => {
              const staffReports = reports.filter((r: Report) => r.author === staff.id);
              const approvedCount = staffReports.filter((r: Report) => r.status === 'approved').length;
              const percentage = staffReports.length > 0 
                ? Math.round((approvedCount / staffReports.length) * 100)
                : 0;
                
              return (
                <div key={staff.id} className="flex items-center gap-2 min-w-[250px]">
                  <div className="w-20 sm:w-32 truncate text-xs sm:text-sm">{staff.name}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 w-8 sm:w-12 text-right">
                    {percentage}%
                  </div>
                </div>
              );
            })}
          {staffList.filter(staff => staff.role === 'Staff').length === 0 && (
            <p className="text-center text-gray-500 py-2">No staff members found</p>
          )}
        </div>
      </div>
    </div>
    
    <div className="space-y-6">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
        <h2 className="text-xl sm:text-2xl font-bold text-[navy] mb-4">Monthly Report Submission</h2>
        <div className="h-48 sm:h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500 text-sm sm:text-base">Chart visualization would appear here</p>
        </div>
      </div>
      
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
        <h2 className="text-xl sm:text-2xl font-bold text-[navy] mb-4">Recent Activity</h2>
        <div className="space-y-4 max-h-60 sm:max-h-72 overflow-y-auto">
          {reports
            .sort((a: Report, b: Report) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10)
            .map((report: Report) => (
              <div key={report.id} className={`border-l-4 pl-4 ${
                report.status === 'approved' ? 'border-green-500' :
                report.status === 'rejected' ? 'border-red-500' :
                'border-[navy]'
              }`}>
                <p className="text-sm font-semibold line-clamp-1">
                  {report.status === 'pending' 
                    ? `${getStaffNameById(report.author)} uploaded ${report.title}`
                    : `${report.title} was ${report.status}`}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(report.date).toLocaleDateString('en-US', { 
                    weekday: 'short',
                    hour: 'numeric',
                    minute: 'numeric'
                  })}
                </p>
              </div>
            ))}
          {reports.length === 0 && (
            <p className="text-center text-gray-500 py-2">No activity found</p>
          )}
        </div>
      </div>
    </div>
  </div>
)}





       </>
  );
};

export default Admin;
