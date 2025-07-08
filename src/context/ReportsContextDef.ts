export type Comment = {
  id: string;
  reportId: string;
  comment: string;
  timestamp: string;
  author: string;
}

export type Report = {
  id: string;
  title: string;
  client: string;
  description: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  author: string;
  file: string;
  reviewDate?: string;
  comments?: Comment[];
  assignedTo?: string; // ID of managing partner assigned to review this report
}

export type ReportsContextType = {
  reports: Report[];
  addReport: (reportData: Omit<Report, 'id' | 'status' | 'comments'>) => void;
  approveReport: (id: string) => void;
  rejectReport: (id: string) => void;
  addComment: (data: { reportId: string; comment: string; timestamp: string; author: string }) => void;
  getUserReports: (userId: string) => Report[];
}


