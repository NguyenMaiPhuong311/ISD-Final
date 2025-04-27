"use client";

import {
  deleteAssignment,
  deleteClass,
  deleteExam,
  deleteStudent,
  deleteSubject,
  deleteTeacher,
  deleteLesson,
  deleteResult,
  deleteAnnouncement,
  deleteSubmission,
  deleteAttendance,
  deleteCalendar,
} from "@/lib/actions";
import {
  deleteAttendanceBulkAction,
  AttendanceDeleteState,
} from "@/lib/attendanceActions";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import { FormContainerProps } from "./FormContainer";

// Map delete handlers
const deleteActionMap = {
  subject: deleteSubject,
  class: deleteClass,
  teacher: deleteTeacher,
  student: deleteStudent,
  exam: deleteExam,
  parent: deleteSubject,
  lesson: deleteLesson,
  assignment: deleteAssignment,
  result: deleteResult,
  event: deleteSubject,
  announcement: deleteAnnouncement,
  submission: deleteSubmission,
  attendance: deleteAttendance,
  calendar: deleteCalendar,
};

// Dynamic imports for all forms
const TeacherForm = dynamic(() => import("./forms/TeacherForm"));
const StudentForm = dynamic(() => import("./forms/StudentForm"));
const SubjectForm = dynamic(() => import("./forms/SubjectForm"));
const ClassForm = dynamic(() => import("./forms/ClassForm"));
const ExamForm = dynamic(() => import("./forms/ExamForm"));
const LessonForm = dynamic(() => import("./forms/LessonForm"));
const ParentForm = dynamic(() => import("./forms/ParentForm"));
const ResultForm = dynamic(() => import("./forms/ResultForm"));
const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"));
const SubmissionForm = dynamic(() => import("./forms/SubmissionForm"));
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"));
const AttendanceForm = dynamic(() => import("./forms/AttendanceForm"));
const CalendarForm = dynamic(() => import("./forms/CalendarForm"));


// Form rendering map
const forms: {
  [key: string]: (
    setOpen: Dispatch<SetStateAction<boolean>>,
    type: "create" | "update",
    data?: any,
    relatedData?: any
  ) => JSX.Element;
} = {
  subject: (setOpen, type, data, relatedData) => <SubjectForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  class: (setOpen, type, data, relatedData) => <ClassForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  teacher: (setOpen, type, data, relatedData) => <TeacherForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  student: (setOpen, type, data, relatedData) => <StudentForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  exam: (setOpen, type, data, relatedData) => <ExamForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  assignment: (setOpen, type, data, relatedData) => <AssignmentForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  submission: (setOpen, type, data, relatedData) => <SubmissionForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  result: (setOpen, type, data, relatedData) => <ResultForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  lesson: (setOpen, type, data, relatedData) => <LessonForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  parent: (setOpen, type, data, relatedData) => <ParentForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  announcement: (setOpen, type, data, relatedData) => <AnnouncementForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  attendance: (setOpen, type, data, relatedData) => <AttendanceForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  calendar: (setOpen, type, data, relatedData) => <CalendarForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />
  
};

const FormModal = ({
  table,
  type,
  data,
  id,
  relatedData,
}: FormContainerProps & { relatedData?: any }) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-lamaYellow"
      : type === "update"
      ? "bg-lamaSky"
      : "bg-lamaPurple";

  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [state, formAction] = useFormState(
    table === "attendance" && type === "delete"
      ? (deleteAttendanceBulkAction as (
          state: AttendanceDeleteState,
          formData: FormData
        ) => Promise<AttendanceDeleteState>)
      : (deleteActionMap[table] as (state: any, formData: FormData) => Promise<any>),
    { success: false, error: false }
  );

  useEffect(() => {
    if (state.success) {
      toast(`${table} has been deleted!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, table]);

  const Form = () => {
    if (type === "delete") {
      if (table === "attendance" && data) {
        return (
          <form action={formAction} className="p-4 flex flex-col gap-4">
            <input type="hidden" name="date" value={data.date} />
            <input type="hidden" name="present" value={data.present} />
            <input type="hidden" name="capacity" value={data.capacity} />
            <input type="hidden" name="classId" value={data.classId} />
            <span className="text-center font-medium">
              All attendance records for this group will be deleted. Are you sure?
            </span>
            <button className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center">
              Delete
            </button>
          </form>
        );
      }

      const targetId = data?.id || id;

      if (targetId) {
        return (
          <form action={formAction} className="p-4 flex flex-col gap-4">
            <input type="hidden" name="id" value={targetId} />
            <span className="text-center font-medium">
              All data will be lost. Are you sure you want to delete this {table}?
            </span>
            <button className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center">
              Delete
            </button>
          </form>
        );
      }
    }

    if (type === "create" || type === "update") {
      return forms[table](setOpen, type, data, relatedData);
    }

    return "Form not found!";
  };

  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
        onClick={() => setOpen(true)}
      >
        <Image src={`/${type}.png`} alt="" width={16} height={16} />
      </button>

      {open && (
        <div className="w-screen h-screen fixed left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            <Form />
            <div
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <Image src="/close.png" alt="close" width={14} height={14} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
