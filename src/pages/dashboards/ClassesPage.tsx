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
  remarks?: string;
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

  const isDark = theme === 'dark';
  const chartColors = {
    text: isDark ? '#e5e7eb' : '#374151',
    grid: isDark ? '#374151' : '#e5e7eb',
    tooltip: isDark ? '#1f2937' : '#ffffff',
  };

  useEffect(() => {
    fetchClasses();
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
  }, [selectedClass, classes, profile]); // include profile in deps because HOD-based teacher filtering depends on it

  const fetchClasses = async () => {
    try {
      // if no profile loaded yet, fetch nothing (or you can fallback to all)
      if (!profile) {
        console.log('no');
        setClasses([]);
        return;
      }

      // Detect if user is HOD: either explicit sub_role 'hod' (admin) OR departments.hod_id = profile.id
      const isSubRoleHod =
        profile.sub_role && profile.sub_role.toString().toLowerCase() === 'hod';
      console.log(isSubRoleHod);
      let isDeptHod = false;

      // Check departments table to confirm if this profile is hod for any department
      const { data: deptCheck, error: deptCheckErr } = await supabase
        .from('departments')
        .select('id')
        .eq('hod_id', profile.id);
      console.log(deptCheck);
      if (deptCheckErr) {
        throw deptCheckErr;
      }

      isDeptHod = Array.isArray(deptCheck) && deptCheck.length > 0;
      const isHod = isSubRoleHod || isDeptHod;

      if (!isHod) {
        // Non-HOD: original behavior -> fetch all active classes
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .eq('status', 'active')
          .order('grade_level', { ascending: true });

        if (error) throw error;

        setClasses(data || []);
        // choose first class if none selected
        if (
          (!selectedClass || selectedClass === '') &&
          data &&
          data.length > 0
        ) {
          setSelectedClass(data[0].id);
        }
        return;
      }

      // HOD path: show only classes where at least one subject belongs to HOD's department(s) in timetable

      // 1) get departments for which user is hod (if deptCheck had data, use it)
      const departmentIds = Array.isArray(deptCheck)
        ? deptCheck.map((d) => d.id)
        : [];

      if (!departmentIds.length) {
        // HOD but no departments found -> show empty list
        setClasses([]);
        setSelectedClass('');
        return;
      }

      // 2) fetch subject ids that belong to these departments
      const { data: subjects, error: subjErr } = await supabase
        .from('subjects')
        .select('id')
        .in('department_id', departmentIds);

      if (subjErr) throw subjErr;

      const subjectIds = Array.isArray(subjects)
        ? subjects.map((s) => s.id)
        : [];

      if (!subjectIds.length) {
        // no subjects for HOD departments -> no classes to show
        setClasses([]);
        setSelectedClass('');
        return;
      }

      // 3) fetch timetables rows that reference those subject ids to get class ids
      const { data: timetableEntries, error: ttErr } = await supabase
        .from('timetables')
        .select('class_id')
        .in('subject_id', subjectIds);

      if (ttErr) throw ttErr;

      const classIds = Array.isArray(timetableEntries)
        ? Array.from(
            new Set(timetableEntries.map((r: any) => r.class_id).filter(Boolean))
          )
        : [];

      if (!classIds.length) {
        // no classes assigned with HOD's subjects
        setClasses([]);
        setSelectedClass('');
        return;
      }

      // 4) finally fetch classes with those ids and active status
      const { data: classesData, error: classesErr } = await supabase
        .from('classes')
        .select('*')
        .in('id', classIds)
        .eq('status', 'active')
        .order('grade_level', { ascending: true });

      if (classesErr) throw classesErr;

      const finalClasses = classesData || [];
      setClasses(finalClasses);

      // pick selectedClass if it's among finalClasses, otherwise choose the first
      if (!finalClasses.find((c: any) => c.id === selectedClass)) {
        if (finalClasses.length > 0) setSelectedClass(finalClasses[0].id);
        else setSelectedClass('');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
      setSelectedClass('');
    }
  };

  // subject teachers assigned to the class from timetable, filtered by HOD's departments
  const fetchClassTeachers = async () => {
    setLoadingTeachers(true);
    try {
      // 1) Check if current user is HOD
      const isSubRoleHod =
        profile?.sub_role && profile.sub_role.toString().toLowerCase() === 'hod';

      const { data: hodDepartments, error: deptErr } = await supabase
        .from('departments')
        .select('id')
        .eq('hod_id', profile?.id);

      if (deptErr) throw deptErr;

      const hodDeptIds = Array.isArray(hodDepartments)
        ? hodDepartments.map((d) => d.id)
        : [];

      const isHod = isSubRoleHod || hodDeptIds.length > 0;

      // 2) fetch timetables for the selected class with subject and teacher details
      const { data, error } = await supabase
        .from('timetables')
        .select(
          `
          id,
          subjects(id, name, code, department_id),
          profiles!timetables_teacher_id_fkey(id, full_name, email, department_id)
        `
        )
        .eq('class_id', selectedClass);

      if (error) throw error;

      // 3) Filter by HOD's departments if user is HOD
      let filtered = data || [];
      if (isHod && hodDeptIds.length > 0) {
        filtered = filtered.filter((row: any) => {
          const subjectDept = row.subjects?.department_id;
          return subjectDept && hodDeptIds.includes(subjectDept);
        });
      }

      // Remove duplicates (same subject-teacher combination might appear multiple times in timetable)
      const uniqueMap = new Map();
      filtered.forEach((item: any) => {
        const key = `${item.subjects?.id}-${item.profiles?.id}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, item);
        }
      });

      const formattedData: TeacherSubject[] = Array.from(uniqueMap.values()).map((item: any) => ({
        id: item.id,
        subject_name: item.subjects?.name || 'N/A',
        subject_code: item.subjects?.code || 'N/A',
        teacher_name: item.profiles?.full_name || 'N/A',
        teacher_email: item.profiles?.email || 'N/A',
      }));

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

      const subjects = Array.isArray(classSubjects)
        ? classSubjects.map((row: any) => row.subjects).filter(Boolean)
        : [];

      // fallback: if there are no class_subjects, we may still want to show subjects present in assignments or exams
      // Fetch subjects referenced by assignments/exams for the class
      if (subjects.length === 0) {
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

        // dedupe by id
        const byId: Record<string, any> = {};
        [...fromAssign, ...fromExam].forEach((s: any) => {
          if (s?.id) byId[s.id] = s;
        });
        subjects.push(...Object.values(byId));
      }

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
        // ensure marks_obtained is numeric
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
    </DashboardLayout>
  );
}
