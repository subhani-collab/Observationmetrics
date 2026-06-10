export interface Employee {
  id: string;
  name: string;
  title: string | null;
  reporting_manager: string | null;
  onboarding_start_date: string | null;
  attendance: string | null;
  engagement: string | null;
  learning_comprehension: string | null;
  product_role_understanding: number | null;
  communication_skills: number | null;
  quiz_result: string | null;
  overall_performance_score: number | null;
  final_notes: string | null;
  video_link: string | null;
  row_hash: string;
  sheet_row: number;
  synced_at: string;
  created_at: string;
  updated_at: string;
}

export interface SyncLog {
  id: number;
  started_at: string;
  completed_at: string | null;
  status: 'running' | 'success' | 'error';
  records_total: number;
  records_added: number;
  records_updated: number;
  records_skipped: number;
  error_message: string | null;
  triggered_by: 'scheduler' | 'manual';
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'viewer';
  created_at: string;
  last_login: string | null;
}

export interface AuditLog {
  id: number;
  user_email: string | null;
  action: string;
  details: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface EmployeeFilters {
  search?: string;
  manager?: string;
  month?: string;
  year?: string;
  sortBy?: 'overall_performance_score' | 'attendance' | 'onboarding_start_date' | 'name';
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardStats {
  totalEmployees: number;
  avgPerformance: number | null;
  avgAttendance: number | null;
  atRiskCount: number;
  onTrackCount: number;
  managers: string[];
}
