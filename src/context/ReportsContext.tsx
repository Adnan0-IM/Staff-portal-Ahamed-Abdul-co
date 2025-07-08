import React, { useState, useContext } from 'react';
import type { Report } from './ReportsContextDef';
import { ReportsContext } from './ReportsContextInstance';

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
};

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<Report[]>([]);

  const addReport = (reportData: Omit<Report, 'id' | 'status' | 'comments'>) => {
    const newReport: Report = {
      ...reportData,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      comments: [],
    };
    setReports((prevReports) => [...prevReports, newReport]);
  };

  const approveReport = (id: string) => {
    setReports((prevReports) =>
      prevReports.map((report) =>
        report.id === id
          ? { ...report, status: 'approved', reviewDate: new Date().toISOString() }
          : report
      )
    );
  };

  const rejectReport = (id: string) => {
    setReports((prevReports) =>
      prevReports.map((report) =>
        report.id === id
          ? { ...report, status: 'rejected', reviewDate: new Date().toISOString() }
          : report
      )
    );
  };

  const getUserReports = (userId: string) => {
    return reports.filter((report) => report.author === userId);
  };

  const addComment = (data: { reportId: string; comment: string; author: string; timestamp: string; }) => {
    setReports((prevReports) =>
      prevReports.map((report) =>
        report.id === data.reportId
          ? {
            ...report,
            comments: [
              ...(report.comments || []),
              {
                id: Math.random().toString(36).substr(2, 9),
                ...data,
              },
            ],
          }
          : report
      )
    );
  };

  return (
    <ReportsContext.Provider
      value={{
        reports,
        addReport,
        approveReport,
        rejectReport,
        getUserReports,
        addComment,
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
}
