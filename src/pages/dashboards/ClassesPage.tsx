import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { RightSidebar } from '../../components/dashboard/RightSidebar';
import {
  Download,
  FileText,
  Image as ImageIcon,
  TrendingUp,
  Edit2,
  Save,
  X,
  Plus,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Notification } from '../../components/Notification';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ClassData {
  id: string;
  name: string;
  grade_level: number;
  section: string;
  capacity: number;
  class_teacher_id: string | null;
  academic_year: string;
  status: string;
  remarks?: string;
}

interface Teacher {
  id: string;
  full_name: string;
  email: string;
}

interface TeacherSubject {
  id: string;
  subject_name: string;
  subject_code: string;
  teacher_name: string;
  teacher_email: string;
}

interface SubjectPerformance {
  subjectId: string;
  subjectName: string;
  subjectCode?: string;
  avgMarks: number; // average marks across exams for this class+subject
  examCount: number;
  assignmentCount: number;
  submissionsCount: number; // total submitted across assignments (submitted + graded)
  assignmentRate: number; // percentage (0-100)
}

export function ClassesPage() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [classTeachers, setClassTeachers] = useState<TeacherSubject[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [editingRemarks, setEditingRemarks] = useState(false);
  const [remarksText, setRemarksText] = useState('');
  const [savingRemarks, setSavingRemarks] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [subjectPerformance, setSubjectPerformance] = useState<
    SubjectPerformance[]
  >([]);
  const [loadingPerformance, setLoadingPerformance] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    grade_level: 1,
    section: '',
    capacity: 30,
    class_teacher_id: '',
    academic_year: new Date().getFullYear().toString(),
    status: 'active',
  });

  const isDark = theme === 'dark';
  const chartColors = {
    text: isDark ? '#e5e7eb' : '#374151',
    grid: isDark ? '#374151' : '#e5e7eb',
    tooltip: isDark ? '#1f2937' : '#ffffff',
  };

  useEffect(() => {
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  useEffect(() => {
    if (selectedClass) {
      fetchClassTeachers();
      fetchSubjectPerformanceForClass();
      const currentClass = classes.find((c) => c.id === selectedClass);
      setRemarksText(currentClass?.remarks || '');
      setEditingRemarks(false);
    } else {
      // reset when no class selected
      setClassTeachers([]);
      setSubjectPerformance([]);
      setRemarksText('');
    }
    // include profile because HOD-based teacher filtering depends on it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, classes, profile]);

  const fetchClasses = async () => {
    console.log('fetchClasses: starting');
    try {
      if (!profile) {
        console.log(
          'fetchClasses: profile not ready yet -> aborting and clearing classes'
        );
        setClasses([]);
        setSelectedClass('');
        return;
      }

      console.log('fetchClasses: profile:', profile);

      const isSubRoleHod =
        profile.sub_role && profile.sub_role.toString().toLowerCase() === 'hod';
      console.log(
        'fetchClasses: isSubRoleHod (from profile.sub_role):',
        isSubRoleHod
      );

      // --- defensive deptCheck using departments.hod_ids (array) ---
      let deptCheck: any[] = [];
      try {
        console.log(
          'fetchClasses: attempting deptCheck by hod_ids contains',
          profile.id
        );

        // Preferred: departments.hod_ids is an array (uuid[] or text[])
        const res1 = await supabase
          .from('departments')
          .select('id')
          .contains('hod_ids', [profile.id]);

        if (res1.error) {
          console.warn(
            'fetchClasses: .contains returned error, attempting fallback queries',
            res1.error
          );

          // fallback 1: maybe there is a single-value column hod_id (older schema)
          const res2 = await supabase
            .from('departments')
            .select('id')
            .eq('hod_id', profile.id);

          if (!res2.error) {
            deptCheck = res2.data || [];
            console.log(
              'fetchClasses: deptCheck (fallback hod_id):',
              deptCheck
            );
          } else {
            // fallback 2: maybe stored by email
            const res3 = await supabase
              .from('departments')
              .select('id')
              .eq('hod_email', profile.email);

            if (!res3.error) {
              deptCheck = res3.data || [];
              console.log(
                'fetchClasses: deptCheck (fallback hod_email):',
                deptCheck
              );
            } else {
              console.error(
                'fetchClasses: all dept checks failed',
                res1.error,
                res2.error,
                res3.error
              );
              deptCheck = [];
            }
          }
        } else {
          deptCheck = res1.data || [];
          console.log(
            'fetchClasses: deptCheck (by hod_ids contains):',
            deptCheck
          );
        }

        // Optional: also try checking if profile.user_id is present inside hod_ids
        if (
          (!deptCheck || deptCheck.length === 0) &&
          (profile as any).user_id &&
          (profile as any).user_id !== profile.id
        ) {
          console.log(
            'fetchClasses: attempting deptCheck by hod_ids contains (user_id)',
            (profile as any).user_id
          );
          const resUid = await supabase
            .from('departments')
            .select('id')
            .contains('hod_ids', [(profile as any).user_id]);

          if (!resUid.error) {
            deptCheck = resUid.data || [];
            console.log(
              'fetchClasses: deptCheck (by user_id in hod_ids):',
              deptCheck
            );
          }
        }

        if (!Array.isArray(deptCheck) || deptCheck.length === 0) {
          console.warn(
            'fetchClasses: deptCheck empty after checking hod_ids (and fallbacks). Possible reasons: departments table uses a different column for HOD, or there are no departments assigned.'
          );
        }
      } catch (err) {
        console.error(
          'fetchClasses: error while checking departments for HOD:',
          err
        );
        deptCheck = [];
      }

      const isDeptHod = Array.isArray(deptCheck) && deptCheck.length > 0;
      const isHod = isSubRoleHod || isDeptHod;
      console.log('fetchClasses: isDeptHod:', isDeptHod, ' => isHod:', isHod);

      // If not HOD (neither sub_role nor dept mapping), fetch all active classes (original behavior)
      if (!isHod) {
        console.log(
          'fetchClasses: non-HOD path -> fetching all active classes'
        );
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .eq('status', 'active')
          .order('grade_level', { ascending: true });

        if (error) {
          console.error(
            'fetchClasses: error fetching classes for non-HOD:',
            error
          );
          throw error;
        }

        console.log('fetchClasses: classes fetched (non-HOD):', data);
        setClasses(data || []);
        if (
          (!selectedClass || selectedClass === '') &&
          data &&
          data.length > 0
        ) {
          setSelectedClass(data[0].id);
        }
        return;
      }

      // HOD path: if we have departmentIds from deptCheck, filter by them; otherwise fallback
      const departmentIds = Array.isArray(deptCheck)
        ? deptCheck.map((d) => d.id)
        : [];
      console.log('fetchClasses: departmentIds for HOD:', departmentIds);

      // HOD filtering: fetch classes based on class_subjects where hod_ids contains current HOD
      console.log(
        'fetchClasses: fetching class_subjects for HOD (hod_ids contains):',
        profile.id
      );
      const { data: classSubjectsData, error: csErr } = await supabase
        .from('class_subjects')
        .select('class_id')
        .contains('hod_ids', [profile.id]);

      if (csErr) {
        console.error(
          'fetchClasses: error fetching class_subjects for HOD:',
          csErr
        );
        throw csErr;
      }

      const classIds = Array.isArray(classSubjectsData)
        ? Array.from(
            new Set(
              classSubjectsData.map((r: any) => r.class_id).filter(Boolean)
            )
          )
        : [];
      console.log(
        'fetchClasses: derived classIds from class_subjects:',
        classIds
      );

      if (!classIds.length) {
        console.log(
          'fetchClasses: no classIds found in class_subjects for HOD -> clearing classes'
        );
        setClasses([]);
        setSelectedClass('');
        return;
      }

      console.log('fetchClasses: fetching classes with ids:', classIds);
      const { data: classesData, error: classesErr } = await supabase
        .from('classes')
        .select('*')
        .in('id', classIds)
        .eq('status', 'active')
        .order('grade_level', { ascending: true });

      if (classesErr) {
        console.error(
          'fetchClasses: error fetching final classes for HOD:',
          classesErr
        );
        throw classesErr;
      }

      const finalClasses = classesData || [];
      console.log('fetchClasses: finalClasses for HOD:', finalClasses);
      setClasses(finalClasses);
      if (!finalClasses.find((c: any) => c.id === selectedClass)) {
        if (finalClasses.length > 0) setSelectedClass(finalClasses[0].id);
        else setSelectedClass('');
      }
    } catch (error) {
      console.error('fetchClasses: unexpected error:', error);
      setClasses([]);
      setSelectedClass('');
    }
  };

  // subject teachers assigned to the class from class_subjects, filtered by HOD's assignments
  const fetchClassTeachers = async () => {
    setLoadingTeachers(true);
    try {
      // 1) Check if current user is HOD
      const isSubRoleHod =
        profile?.sub_role &&
        profile.sub_role.toString().toLowerCase() === 'hod';

      // Prefer departments.hod_ids (array) membership check
      let hodDeptIds: string[] = [];
      try {
        const { data: hodDepartmentsByArray, error: arrErr } = await supabase
          .from('departments')
          .select('id')
          .contains('hod_ids', [profile?.id]);

        if (!arrErr) {
          hodDeptIds = Array.isArray(hodDepartmentsByArray)
            ? hodDepartmentsByArray.map((d: any) => d.id)
            : [];
        } else {
          console.warn(
            'fetchClassTeachers: contains(hod_ids) failed, trying eq fallbacks',
            arrErr
          );

          // fallback to single hod_id column if present
          const { data: hodDepartmentsByEq, error: eqErr } = await supabase
            .from('departments')
            .select('id')
            .eq('hod_id', profile?.id);

          if (!eqErr) {
            hodDeptIds = Array.isArray(hodDepartmentsByEq)
              ? hodDepartmentsByEq.map((d: any) => d.id)
              : [];
          } else {
            // final fallback: maybe departments stores HOD by email
            const { data: hodDepartmentsByEmail, error: emailErr } =
              await supabase
                .from('departments')
                .select('id')
                .eq('hod_email', profile?.email);

            if (!emailErr) {
              hodDeptIds = Array.isArray(hodDepartmentsByEmail)
                ? hodDepartmentsByEmail.map((d: any) => d.id)
                : [];
            } else {
              console.error(
                'fetchClassTeachers: all department lookups failed',
                arrErr,
                eqErr,
                emailErr
              );
              hodDeptIds = [];
            }
          }
        }

        // also try profile.user_id membership as fallback if nothing found
        if (
          hodDeptIds.length === 0 &&
          (profile as any).user_id &&
          (profile as any).user_id !== profile?.id
        ) {
          const { data: byUserId, error: userIdErr } = await supabase
            .from('departments')
            .select('id')
            .contains('hod_ids', [(profile as any).user_id]);

          if (!userIdErr) {
            hodDeptIds = Array.isArray(byUserId)
              ? byUserId.map((d: any) => d.id)
              : [];
          }
        }
      } catch (err) {
        console.error(
          'fetchClassTeachers: unexpected error while reading departments:',
          err
        );
        hodDeptIds = [];
      }

      const isHod = isSubRoleHod || hodDeptIds.length > 0;

      // 2) fetch class_subjects for the selected class with subject and teacher details
      let query = supabase
        .from('class_subjects')
        .select(
          `
          id,
          subjects(id, name, code, department_id),
          profiles!class_subjects_teacher_id_fkey(id, full_name, email, department_id)
        `
        )
        .eq('class_id', selectedClass);

      // 3) If HOD, filter by hod_ids contains current HOD
      if (isHod) {
        query = query.contains('hod_ids', [profile?.id]);
      }

      const { data, error } = await query;

      if (error) throw error;

      let filtered = data || [];

      // Normalize profiles shape (object vs array) so teacher name/email don't become undefined
      const formattedData: TeacherSubject[] = (filtered || []).map(
        (item: any) => {
          // Normalize the profiles join: Supabase sometimes returns an object, sometimes an array
          let teacherRecord: any = null;
          if (!item) teacherRecord = null;
          else if (Array.isArray(item.profiles))
            teacherRecord = item.profiles[0] || null;
          else teacherRecord = item.profiles || null;

          const teacherName = teacherRecord?.full_name || 'N/A';
          const teacherEmail = teacherRecord?.email || 'N/A';

          return {
            id: item.id,
            subject_name: item.subjects?.name || 'N/A',
            subject_code: item.subjects?.code || 'N/A',
            teacher_name: teacherName,
            teacher_email: teacherEmail,
          };
        }
      );

      setClassTeachers(formattedData);
    } catch (error) {
      console.error('Error fetching class teachers:', error);
      setClassTeachers([]);
    } finally {
      setLoadingTeachers(false);
    }
  };

  // calculates average marks and assignment metrics per subject for the selected class
  const fetchSubjectPerformanceForClass = async () => {
    if (!selectedClass) return;
    setLoadingPerformance(true);
    try {
      // 1) total active students (used to compute assignment submission rate)
      const { count: totalStudentsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')
        .eq('status', 'active');

      const totalStudents = totalStudentsCount || 0;

      // 2) fetch subjects assigned to this class via class_subjects (so we show only relevant subjects)
      const { data: classSubjects, error: csErr } = await supabase
        .from('class_subjects')
        .select('subjects(id, name, code)')
        .eq('class_id', selectedClass);

      if (csErr) throw csErr;

      // map rows -> subjects and dedupe by subject id immediately
      const rawSubjects = Array.isArray(classSubjects)
        ? classSubjects.map((row: any) => row.subjects).filter(Boolean)
        : [];

      const byId: Record<string, any> = {};
      rawSubjects.forEach((s: any) => {
        if (s?.id) byId[s.id] = s; // last-wins but all fields are same usually
      });

      // fallback: if class_subjects returned nothing, also collect from assignments/exams
      if (Object.keys(byId).length === 0) {
        // gather subject ids from assignments
        const { data: assignSubjects, error: asErr } = await supabase
          .from('assignments')
          .select('subject_id, subject:subjects(id, name, code)')
          .eq('class_id', selectedClass);

        if (asErr) throw asErr;
        const fromAssign = (assignSubjects || [])
          .map((r: any) => r.subject)
          .filter(Boolean);

        // gather subject ids from exams
        const { data: examSubjects, error: exErr } = await supabase
          .from('exams')
          .select('subject_id, subject:subjects(id, name, code)')
          .eq('class_id', selectedClass);

        if (exErr) throw exErr;
        const fromExam = (examSubjects || [])
          .map((r: any) => r.subject)
          .filter(Boolean);

        // dedupe by id and merge
        [...fromAssign, ...fromExam].forEach((s: any) => {
          if (s?.id) byId[s.id] = s;
        });
      }

      // Final subjects array (unique by id)
      const subjects = Object.values(byId);

      // If still empty, set empty state
      if (subjects.length === 0) {
        setSubjectPerformance([]);
        setLoadingPerformance(false);
        return;
      }

      // Build a subject performance array
      const perfArr: SubjectPerformance[] = [];

      // We'll gather some caches to reduce queries:
      // - examsBySubject: map subjectId -> exam ids for this class
      // - examResultsByExam: map examId -> array of marks
      // - assignmentsBySubject: map subjectId -> assignment ids
      // - submissionsByAssignment: map assignmentId -> submittedCount
      // To avoid many round-trips, we do a few batched queries.

      // A) Fetch all exams for this class (we need exam.id and exam.subject_id)
      const { data: examsForClass, error: examErr } = await supabase
        .from('exams')
        .select('id, subject_id')
        .eq('class_id', selectedClass);

      if (examErr) throw examErr;
      const exams = examsForClass || [];

      // map subject -> exam ids
      const examsBySubject: Record<string, string[]> = {};
      exams.forEach((ex: any) => {
        if (!ex || !ex.subject_id) return;
        examsBySubject[ex.subject_id] = examsBySubject[ex.subject_id] || [];
        examsBySubject[ex.subject_id].push(ex.id);
      });

      // B) Fetch all exam_results for these exam ids (if any)
      const allExamIds = exams.map((e: any) => e.id).filter(Boolean);
      let examResults: any[] = [];
      if (allExamIds.length > 0) {
        const { data: erData, error: erErr } = await supabase
          .from('exam_results')
          .select('exam_id, marks_obtained')
          .in('exam_id', allExamIds);
        if (erErr) throw erErr;
        examResults = erData || [];
      }

      // group marks by exam id for quick lookup
      const marksByExam: Record<string, number[]> = {};
      examResults.forEach((r: any) => {
        if (!r || !r.exam_id) return;
        marksByExam[r.exam_id] = marksByExam[r.exam_id] || [];
        const m = Number(r.marks_obtained);
        if (!Number.isNaN(m)) marksByExam[r.exam_id].push(m);
      });

      // C) Fetch assignments for this class (we need assignment.id, subject_id)
      const { data: assignmentsForClass, error: aErr } = await supabase
        .from('assignments')
        .select('id, subject_id')
        .eq('class_id', selectedClass);

      if (aErr) throw aErr;
      const assignments = assignmentsForClass || [];

      // group assignments by subject
      const assignmentsBySubject: Record<string, string[]> = {};
      assignments.forEach((a: any) => {
        if (!a || !a.subject_id) return;
        assignmentsBySubject[a.subject_id] =
          assignmentsBySubject[a.subject_id] || [];
        assignmentsBySubject[a.subject_id].push(a.id);
      });

      // D) Fetch submission counts for assignments (submitted or graded)
      const allAssignmentIds = assignments
        .map((a: any) => a.id)
        .filter(Boolean);
      let submissionsData: any[] = [];
      if (allAssignmentIds.length > 0) {
        const { data: subData, error: subErr } = await supabase
          .from('assignment_submissions')
          .select('assignment_id, status, id')
          .in('assignment_id', allAssignmentIds)
          .in('status', ['submitted', 'graded']); // only count submitted/graded
        if (subErr) throw subErr;
        submissionsData = subData || [];
      }

      // group submission counts by assignment id
      const submissionsCountByAssignment: Record<string, number> = {};
      submissionsData.forEach((s: any) => {
        if (!s || !s.assignment_id) return;
        submissionsCountByAssignment[s.assignment_id] =
          (submissionsCountByAssignment[s.assignment_id] || 0) + 1;
      });

      // E) For each subject, compute avg marks, assignmentCount, submissionsCount, assignmentRate
      for (const subj of subjects) {
        const sid = subj.id;
        // exams for this subject
        const examIdsForSubj = examsBySubject[sid] || [];
        // collect all marks from exams belonging to this subject
        let marksAll: number[] = [];
        examIdsForSubj.forEach((eid) => {
          const arr = marksByExam[eid] || [];
          marksAll = marksAll.concat(arr);
        });
        const examCount = examIdsForSubj.length;
        const avgMarks =
          marksAll.length > 0
            ? marksAll.reduce((s, m) => s + m, 0) / marksAll.length
            : 0;

        // assignments for this subject
        const assignIds = assignmentsBySubject[sid] || [];
        const assignmentCount = assignIds.length;
        // total submissions across assignments for this subject
        let subjSubmissions = 0;
        assignIds.forEach((aid) => {
          subjSubmissions += submissionsCountByAssignment[aid] || 0;
        });

        // assignmentRate: (submissions) / (totalStudents * assignmentCount)
        // If no students or no assignments, rate = 0
        let assignmentRate = 0;
        if (totalStudents > 0 && assignmentCount > 0) {
          const possibleSubmissions = totalStudents * assignmentCount;
          assignmentRate = Math.round(
            (subjSubmissions / possibleSubmissions) * 100
          );
        }

        perfArr.push({
          subjectId: sid,
          subjectName: subj.name || 'Unknown',
          subjectCode: subj.code || undefined,
          avgMarks: Math.round(avgMarks * 10) / 10, // keep one decimal
          examCount,
          assignmentCount,
          submissionsCount: subjSubmissions,
          assignmentRate,
        });
      }

      // sort by subject name
      perfArr.sort((a, b) => a.subjectName.localeCompare(b.subjectName));

      setSubjectPerformance(perfArr);
    } catch (error) {
      console.error('Error fetching subject performance:', error);
      setSubjectPerformance([]);
    } finally {
      setLoadingPerformance(false);
    }
  };

  const getSelectedClassName = () => {
    const classData = classes.find((c) => c.id === selectedClass);
    return classData ? `${classData.name}` : 'Select a Class';
  };

  const handleSaveRemarks = async () => {
    if (!selectedClass) return;

    setSavingRemarks(true);
    try {
      const { error } = await supabase
        .from('classes')
        .update({ remarks: remarksText.trim() || null })
        .eq('id', selectedClass);

      if (error) throw error;

      setClasses((prev) =>
        prev.map((c) =>
          c.id === selectedClass
            ? { ...c, remarks: remarksText.trim() || undefined }
            : c
        )
      );
      setEditingRemarks(false);
      setNotification({
        type: 'success',
        message: 'Remarks saved successfully!',
      });
    } catch (error) {
      console.error('Error saving remarks:', error);
      setNotification({
        type: 'error',
        message: 'Failed to save remarks. Please try again.',
      });
    } finally {
      setSavingRemarks(false);
    }
  };

  const canEditRemarks = () => {
    return profile?.sub_role === 'head' || profile?.sub_role === 'principal';
  };

  const canAddClass = () => {
    return (
      profile?.role === 'admin' &&
      profile?.sub_role !== 'hod'
    );
  };

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('role', ['professor'])
        .eq('approval_status', 'approved')
        .order('full_name');

      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleCreateClass = async () => {
    if (!formData.name || !formData.section) {
      setNotification({
        type: 'error',
        message: 'Please fill in all required fields',
      });
      return;
    }

    try {
      const { error } = await supabase.from('classes').insert({
        name: formData.name,
        grade_level: formData.grade_level,
        section: formData.section,
        capacity: formData.capacity,
        class_teacher_id: formData.class_teacher_id || null,
        academic_year: formData.academic_year,
        status: formData.status,
        current_strength: 0,
      });

      if (error) throw error;

      setNotification({
        type: 'success',
        message: 'Class created successfully',
      });
      setShowCreateModal(false);
      setFormData({
        name: '',
        grade_level: 1,
        section: '',
        capacity: 30,
        class_teacher_id: '',
        academic_year: new Date().getFullYear().toString(),
        status: 'active',
      });
      fetchClasses();
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.message || 'Error creating class',
      });
    }
  };

  const exportToPDF = () => {
    setNotification({
      type: 'success',
      message: 'PDF export functionality would be implemented here',
    });
  };

  const exportToExcel = () => {
    setNotification({
      type: 'success',
      message: 'Excel export functionality would be implemented here',
    });
  };

  const exportToImage = () => {
    setNotification({
      type: 'success',
      message: 'Image export functionality would be implemented here',
    });
  };

  // Chart-friendly data for subject-wise performance (avgMarks + assignmentRate)
  const subjectChartData = subjectPerformance.map((s) => ({
    subject: s.subjectName,
    avgMarks: s.avgMarks,
    assignmentRate: s.assignmentRate,
  }));

  const overall = {
    avgMarks:
      subjectPerformance.length > 0
        ? subjectPerformance.reduce((sum, s) => sum + s.avgMarks, 0) /
          subjectPerformance.length
        : 0,
    avgAssignmentRate:
      subjectPerformance.length > 0
        ? Math.round(
            subjectPerformance.reduce((sum, s) => sum + s.assignmentRate, 0) /
              subjectPerformance.length
          )
        : 0,
    totalSubjects: subjectPerformance.length,
    totalAssignments: subjectPerformance.reduce(
      (sum, s) => sum + s.assignmentCount,
      0
    ),
  };

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                Class Performance Analytics
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Comprehensive performance metrics (live from DB)
              </p>
            </div>

            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {canAddClass() && (
                <button
                  onClick={() => {
                    setShowCreateModal(true);
                    fetchTeachers();
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Add Class
                </button>
              )}
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full sm:w-auto px-3 sm:px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-[180px]"
              >
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <button
                  onClick={exportToPDF}
                  className="p-2.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  title="Export as PDF"
                >
                  <FileText className="h-5 w-5" />
                </button>
                <button
                  onClick={exportToExcel}
                  className="p-2.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                  title="Export as Excel"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  onClick={exportToImage}
                  className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  title="Export as Image"
                >
                  <ImageIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 rounded-2xl p-4 sm:p-6 text-white">
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">
              {getSelectedClassName()} Performance Overview
            </h3>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <span className="text-blue-100 dark:text-blue-200 text-sm font-medium">
                  Class Teacher:
                </span>
                <p className="text-white text-sm">—</p>
              </div>
            </div>
          </div>

          {canEditRemarks() && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row justify-between gap-3 sm:items-center mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">
                  Class Remarks
                </h3>
                {!editingRemarks ? (
                  <button
                    onClick={() => setEditingRemarks(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Remarks
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveRemarks}
                      disabled={savingRemarks}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="h-4 w-4" />
                      {savingRemarks ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingRemarks(false);
                        const currentClass = classes.find(
                          (c) => c.id === selectedClass
                        );
                        setRemarksText(currentClass?.remarks || '');
                      }}
                      disabled={savingRemarks}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {editingRemarks ? (
                <textarea
                  value={remarksText}
                  onChange={(e) => setRemarksText(e.target.value)}
                  placeholder="Enter remarks for this class..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                />
              ) : (
                <div className="min-h-[100px] px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  {remarksText ? (
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {remarksText}
                    </p>
                  ) : (
                    <p className="text-gray-400 dark:text-gray-500 italic">
                      No remarks added yet
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Avg. Marks
                </span>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                {overall.avgMarks.toFixed(1)}%
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                {overall.totalSubjects} subjects
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border-l-4 border-orange-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Assignments (total)
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                {overall.totalAssignments}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Across all subjects
              </div>
            </div>

            <div className="col-span-2 bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Avg Assignment Submission Rate
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                {overall.avgAssignmentRate}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Avg % of possible submissions completed
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-3 sm:mb-4">
              Subject-wise Performance Metrics
            </h3>
            <div className="h-[380px] sm:h-[420px]">
              {loadingPerformance ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : subjectChartData.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No subject performance data available for this class.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={chartColors.grid}
                    />
                    <XAxis dataKey="subject" stroke={chartColors.text} />
                    <YAxis stroke={chartColors.text} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: chartColors.tooltip,
                        border: `1px solid ${chartColors.grid}`,
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: chartColors.text }}
                    />
                    <Legend wrapperStyle={{ color: chartColors.text }} />
                    <Bar dataKey="avgMarks" fill="#3B82F6" name="Avg Marks" />
                    <Bar
                      dataKey="assignmentRate"
                      fill="#10B981"
                      name="Assignment Rate %"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5">
            <div className="flex justify-between items-start sm:items-center mb-3 sm:mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">
                  Detailed Subject Metrics
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Avg marks and assignment stats per subject
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-3 sm:px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Subject
                    </th>
                    <th className="text-center py-3 px-3 sm:px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Avg Marks
                    </th>
                    <th className="text-center py-3 px-3 sm:px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Exams Count
                    </th>
                    <th className="text-center py-3 px-3 sm:px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Assignments
                    </th>
                    <th className="text-center py-3 px-3 sm:px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Submissions
                    </th>
                    <th className="text-center py-3 px-3 sm:px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Assignment Rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subjectPerformance.map((s) => (
                    <tr
                      key={s.subjectId}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="py-3 px-3 sm:px-4 font-medium text-gray-800 dark:text-gray-200">
                        {s.subjectName}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center">
                        {s.avgMarks}%
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center">
                        {s.examCount}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center">
                        {s.assignmentCount}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center">
                        {s.submissionsCount}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center">
                        {s.assignmentRate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5">
            <div className="flex justify-between items-start sm:items-center mb-3 sm:mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">
                  Subject Teachers (assigned by your HOD)
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Teachers assigned to {getSelectedClassName()} (filtered by
                  HOD)
                </p>
              </div>
            </div>

            {loadingTeachers ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : classTeachers.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No teachers assigned to this class by your HOD.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {classTeachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 dark:text-white">
                          {teacher.subject_name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {teacher.subject_code}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-semibold text-sm">
                        {teacher.teacher_name?.charAt(0)?.toUpperCase() || 'T'}
                      </div>
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {teacher.teacher_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {teacher.teacher_email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <RightSidebar />
      </div>

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Add New Class
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({
                    name: '',
                    grade_level: 1,
                    section: '',
                    capacity: 30,
                    class_teacher_id: '',
                    academic_year: new Date().getFullYear().toString(),
                    status: 'active',
                  });
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Class Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Class 10-A"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Section *
                  </label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) =>
                      setFormData({ ...formData, section: e.target.value })
                    }
                    placeholder="e.g., A"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Grade Level *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={formData.grade_level}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        grade_level: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacity: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Class Teacher
                  </label>
                  <select
                    value={formData.class_teacher_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        class_teacher_id: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select teacher</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Academic Year *
                  </label>
                  <input
                    type="text"
                    value={formData.academic_year}
                    onChange={(e) =>
                      setFormData({ ...formData, academic_year: e.target.value })
                    }
                    placeholder="e.g., 2024"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({
                      name: '',
                      grade_level: 1,
                      section: '',
                      capacity: 30,
                      class_teacher_id: '',
                      academic_year: new Date().getFullYear().toString(),
                      status: 'active',
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateClass}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Class
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
