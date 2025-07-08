import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportsContext';

import { useNavigate } from 'react-router-dom';

export default function Reports() {
  const { currentUser: user, staffList, isPartner, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect managing partners and admins away from Reports page
  useEffect(() => {
    // If admin, redirect to admin dashboard
    if (isAdmin) {
      navigate('/staffportal/admin', { replace: true });
    }
    // If managing partner, redirect to partners page
    else if (isPartner) {
      navigate('/staffportal/partners', { replace: true });
    }
  }, [isPartner, isAdmin, navigate]);
  const { reports, addReport } = useReports();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const [formData, setFormData] = useState({
    title: '',
    client: '',
    description: '',
    file: null as File | null,
    assignedTo: '', // ID of managing partner to review the report
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData((prev) => ({ ...prev, file: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.file) return;

    setIsSubmitting(true);
    try {
      const fileUrl = URL.createObjectURL(formData.file);
      
      await addReport({
        title: formData.title,
        client: formData.client,
        description: formData.description,
        date: new Date().toISOString(),
        author: user.id,
        file: fileUrl,
        assignedTo: formData.assignedTo, // Include assignedTo in the report data
      });

      setFormData({
        title: '',
        client: '',
        description: '',
        file: null,
        assignedTo: '',
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // For admins, show all reports; for regular users, only show their own
  
  const filteredReports = reports
    .filter((report) => isAdmin ? true : report.author === user?.id) // Admins see all reports
    .filter((report) => 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((report) => statusFilter === 'all' ? true : report.status === statusFilter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="">
    
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 min-h-screen">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#052659]">
              {isAdmin ? 'All Reports Management' : 'My Reports Management'}
            </h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-[#052659] text-white px-4 py-2 rounded-lg hover:bg-[#0a5fde] transition-colors flex items-center gap-2"
            >
              {showForm ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Cancel
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  New Report
                </>
              )}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-6 bg-white mb-6">
              <h2 className="text-xl font-bold text-[#052659] mb-6">
                {isAdmin ? 'Create New Report' : 'Submit New Report'}
              </h2>
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

              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
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
                      {isAdmin ? 'Create Report' : 'Submit Report'}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#052659] focus:ring-[#052659] px-4 py-3"
              />
            </div>
            <div className="flex-shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
                className="w-full md:w-auto rounded-lg border-gray-300 shadow-sm focus:border-[#052659] focus:ring-[#052659] px-4 py-3"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? "Try adjusting your filters"
                    : "Get started by creating a new report"}
                </p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div key={report.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${report.status === 'approved' ? 'bg-green-100 text-green-800' :
                            report.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'}`}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <svg className="flex-shrink-0 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(report.date).toLocaleDateString()}
                          <span className="mx-2">•</span>
                          <svg className="flex-shrink-0 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {report.client}
                        </div>
                        <p className="mt-3 text-sm text-gray-600">
                          {report.description}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownload(report.id, report.file)}
                        disabled={downloadingId === report.id}
                        className="ml-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#052659] disabled:opacity-50"
                      >
                        {downloadingId === report.id ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Downloading...
                          </>
                        ) : (
                          <>
                            <svg className="-ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
  
    </div>
  );
}