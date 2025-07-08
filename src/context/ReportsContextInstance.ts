import React from 'react';
import type { ReportsContextType } from './ReportsContextDef';

export const ReportsContext = React.createContext<ReportsContextType | null>(null);
