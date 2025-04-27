import { z } from "zod";

export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  teachers: z.array(z.string()), //teacher ids
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

export const classSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  capacity: z.coerce.number().min(1, { message: "Capacity name is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade name is required!" }),
  supervisorId: z.coerce.string().optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;

export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  subjects: z.array(z.string()).optional(), // subject ids
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

export const studentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade is required!" }),
  classId: z.coerce.number().min(1, { message: "Class is required!" }),
  parentId: z.string().min(1, { message: "Parent Id is required!" }),
});

export type StudentSchema = z.infer<typeof studentSchema>;

export const examSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title name is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  lessonId: z.coerce.number({ message: "Lesson is required!" }),
});

export type ExamSchema = z.infer<typeof examSchema>;

export const announcementSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  date: z.coerce.date({ message: "Date is required!" }),
  classId: z.coerce.number({ message: "Class is required!" }).optional(),
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;

export const assignmentSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Assignment title is required!" }),
  startDate: z.coerce.date({ message: "Start date is required!" }),
  dueDate: z.coerce.date({ message: "Due date is required!" }),
  lessonId: z.coerce.number({ message: "Lesson is required!" }),
  fileUrl: z.string().min(1, { message: "File URL is required!" }),
});

export type AssignmentSchema = z.infer<typeof assignmentSchema>;

export const attendanceSchema = z.object({
  id: z.coerce.number().optional(),
  date: z.coerce.date({ message: "Date is required" }),
  present: z.boolean({ message: "Presence status is required" }), // ❗ Đã sửa
  capacity: z.coerce.number().min(0, { message: "Capacity must be a number" }),
  studentIds: z.array(z.string()).optional(), // studentIds is optional
  classId: z.coerce.number().min(1, { message: "Class is required!" }),
});

export type AttendanceSchema = z.infer<typeof attendanceSchema>;

export const lessonSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Lesson name is required!" }),
  title: z.string().min(1, { message: "Title is required!" }),
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  subjectId: z.coerce.number().min(1, { message: "Subject is required!" }),
  classId: z.coerce.number().min(1, { message: "Class is required!" }),
  teacherId: z.string().min(1, { message: "Teacher is required!" }),
  description: z.string().optional(),
  content: z.string().optional(),
  fileUrl: z.string().min(1, { message: "File URL is required!" }),
});

export type LessonSchema = z.infer<typeof lessonSchema>;

export const parentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")), // Không bắt buộc khi cập nhật
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")), // Không bắt buộc
  phone: z.string().min(1, { message: "Phone number is required!" }),
  address: z.string().min(1, { message: "Address is required!" }),
  createdAt: z.date().optional(), // Không cần nhập, Prisma sẽ tự động set
  students: z.array(z.string()).optional(), // Mảng ID của students
});

export type ParentSchema = z.infer<typeof parentSchema>;

export const resultSchema = z
  .object({
    id: z.coerce.number().optional(),
    score: z.coerce
      .number()
      .min(0, { message: "Score must be at least 0!" })
      .max(10, { message: "Score cannot exceed 10!" }),
    examId: z.coerce.number().optional(),
    assignmentId: z.coerce.number().optional(),
    studentId: z.string().min(1, { message: "Student ID is required!" }),
  })
  .refine(
    (data) =>
      (data.examId && !data.assignmentId) ||
      (!data.examId && data.assignmentId),
    {
      message: "You must select either an exam or an assignment, not both!",
      path: ["examId"],
    }
  )
  .refine((data) => data.examId || data.assignmentId, {
    message: "Either exam or assignment is required!",
    path: ["examId"],
  });

export type ResultSchema = z.infer<typeof resultSchema>;

export const submissionSchema = z.object({
  id: z.string().optional(),
  assignmentId: z.string(),
  studentId: z.string(),
  fileUrl: z.string().min(1, { message: "File URL is required!" }),
  note: z.string().optional(),
});

export type SubmissionSchema = z.infer<typeof submissionSchema>;

export const calendarSchema = z.object({
  id: z.coerce.number().optional(), // Optional for edit mode

  teacherId: z.string().min(1, { message: "Teacher is required!" }),

  classId: z.coerce.number({ message: "Class is required!" }),

  subjectIds: z
    .array(z.coerce.number())
    .min(1, { message: "At least one subject is required!" }),

  // Time format: HH:mm
  startTime: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
    message: "Invalid start time format (HH:mm)",
  }),

  endTime: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
    message: "Invalid end time format (HH:mm)",
  }),

  // Day of week, e.g., "Monday"
  dayOfWeek: z
    .string()
    .min(1, { message: "Day of the week is required!" })
    .refine(
      (day) =>
        [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ].includes(day),
      { message: "Invalid day of the week" }
    ),
});

export type CalendarSchema = z.infer<typeof calendarSchema>;
