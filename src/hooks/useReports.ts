import { useContext } from 'react';
import { ReportsContext } from '../context/ReportsContextInstance';


export function useReports() {
  const context = useContext(ReportsContext);
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
}
