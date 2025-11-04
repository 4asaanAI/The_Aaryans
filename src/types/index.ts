export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'professor' | 'student';
  sub_role?: string | null;
  department_id?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  tuition_fee: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  department_id: string;
  code: string;
  name: string;
  description?: string;
  credits: number;
  professor_id?: string;
  capacity: number;
  schedule: Record<string, any>;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
  department?: Department;
  professor?: Profile;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'active' | 'completed';
  payment_status: 'unpaid' | 'partial' | 'paid';
  payment_amount: number;
  enrolled_date?: string;
  created_at: string;
  updated_at: string;
  student?: Profile;
  course?: Course;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
}

export interface RolePermission {
  id: string;
  role: string;
  sub_role?: string;
  permission_id: string;
  permission?: Permission;
}

export interface Announcement {
  id: string;
  author_id?: string;
  title: string;
  content: string;
  target_audience: 'all' | 'students' | 'professors' | 'department';
  department_id?: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  author?: Profile;
  department?: Department;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  changes: Record<string, any>;
  ip_address?: string;
  created_at: string;
  user?: Profile;
}

export type SubRole =
  | 'super_admin'
  | 'academic_admin'
  | 'finance_admin'
  | 'department_admin'
  | 'head_of_department'
  | 'senior_professor'
  | 'assistant_professor'
  | 'guest_lecturer'
  | null;

export const adminSubRoles = [
  { value: 'super_admin', label: 'Super Admin', description: 'Full system access' },
  { value: 'academic_admin', label: 'Academic Admin', description: 'Course and academic management' },
  { value: 'finance_admin', label: 'Finance Admin', description: 'Financial operations and reports' },
  { value: 'department_admin', label: 'Department Admin', description: 'Department-specific management' }
];

export const professorSubRoles = [
  { value: 'head_of_department', label: 'Head of Department', description: 'Department leadership role' },
  { value: 'senior_professor', label: 'Senior Professor', description: 'Full teaching privileges' },
  { value: 'assistant_professor', label: 'Assistant Professor', description: 'Standard teaching role' },
  { value: 'guest_lecturer', label: 'Guest Lecturer', description: 'Limited teaching access' }
];
