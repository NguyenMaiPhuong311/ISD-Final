"use server";

import { revalidatePath } from "next/cache";
import {
  ClassSchema,
  ExamSchema,
  LessonSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
  AssignmentSchema,
  ParentSchema,
  ResultSchema,
  AnnouncementSchema,
  SubmissionSchema,
  AttendanceSchema,
  CalendarSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";
import { clerkClient } from "@clerk/nextjs/server";

type CurrentState = { success: boolean; error: boolean };

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.create({
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.update({
      where: {
        id: data.id,
      },
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.class.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "teacher" },
    });

    await prisma.teacher.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          set: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });
    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.teacher.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  console.log(data);
  try {
    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return { success: false, error: true };
    }

    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "student" },
    });

    await prisma.student.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });
    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.student.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  console.log("Creating parent:", data);
  try {
    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "parent" },
    });

    await prisma.parent.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating parent:", err);
    return { success: false, error: true };
  }
};

export const updateParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }

  try {
    await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.parent.update({
      where: { id: data.id },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating parent:", err);
    return { success: false, error: true };
  }
};

export const deleteParent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.parent.delete({
      where: { id: id },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting parent:", err);
    return { success: false, error: true };
  }
};

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  try {
    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.exam.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    await prisma.exam.delete({
      where: {
        id: parseInt(id),
        // ...(role === "teacher" ? { lesson: { teacherId: userId! } } : {}),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId ?? null, // optional
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};
export const updateAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    await prisma.announcement.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId ?? null,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};
export const deleteAnnouncement = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  try {
    await prisma.announcement.delete({
      where: {
        id: parseInt(id),
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const createAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  try {
    await prisma.assignment.create({
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
        fileUrl: data.fileUrl ?? null,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  try {
    await prisma.assignment.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
        fileUrl: data.fileUrl ?? null,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
// export const deleteAssignment = async (
//   currentState: CurrentState,
//   data: FormData
// ) => {
//   const id = data.get("id") as string;

//   try {
//     await prisma.assignment.delete({
//       where: {
//         id: parseInt(id),
//       },
//     });

//     return { success: true, error: false };
//   } catch (err) {
//     console.log(err);
//     return { success: false, error: true };
//   }
// };
export async function deleteAssignment(state: any, formData: FormData) {
  const id = parseInt(formData.get("id") as string);

  try {
    // Xóa tất cả submission liên quan trước
    await prisma.submission.deleteMany({
      where: { assignmentId: id },
    });

    // Sau đó xóa assignment
    await prisma.assignment.delete({
      where: { id },
    });

    return { success: true, error: false };
  } catch (error) {
    console.error("Delete Assignment Error:", error);
    return { success: false, error: true };
  }
}

export const createAttendance = async (
  currentState: any,
  data: AttendanceSchema
) => {
  try {
    // Case: No students selected
    if (!data.studentIds || data.studentIds.length === 0) {
      const record = {
        date: data.date,
        present: false, // Default value
        capacity: data.capacity, // Include capacity
        classId: data.classId, // Class association
        studentId: null, // Allow null value
      };

      await prisma.attendance.create({
        data: record, // Create attendance without student association
      });

      return { success: true, error: false };
    }

    // Case: Students are selected
    const records = data.studentIds.map((studentId) => ({
      date: data.date,
      present: false, // Default value
      capacity: data.capacity, // Include capacity
      studentId, // Assign studentId
      classId: data.classId,
    }));

    await prisma.attendance.createMany({
      data: records,
      skipDuplicates: false,
    });

    return { success: true, error: false };
  } catch (err) {
    console.log("Error creating attendance: ", err);
    return {
      success: false,
      error: true,
      message: "Failed to create attendance",
    };
  }
};

export const updateAttendance = async (
  currentState: any,
  data: AttendanceSchema
) => {
  try {
    // If no student is selected, do not update studentId
    const updatedData: any = {
      date: data.date,
      present: data.present,
      capacity: data.capacity, // Include capacity
      classId: data.classId, // Keep classId
    };

    // Only update studentId if it's selected
    if (data.studentIds && data.studentIds.length > 0) {
      updatedData.studentId = data.studentIds[0]; // Assign the first studentId
    }

    await prisma.attendance.update({
      where: {
        id: data.id,
      },
      data: updatedData, // Update the selected fields
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAttendance = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  try {
    await prisma.attendance.delete({
      where: {
        id: parseInt(id),
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createSubmission = async (
  currentState: CurrentState,
  data: SubmissionSchema
) => {
  try {
    await prisma.submission.create({
      data: {
        assignmentId: parseInt(data.assignmentId),
        studentId: data.studentId,
        fileUrl: data.fileUrl ?? null,
        note: data.note || null,
        submittedAt: new Date(),
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("❌ Error creating submission:", err);
    return {
      success: false,
      error: true,
      message: "Failed to create submission.",
    };
  }
};
export const updateSubmission = async (
  currentState: CurrentState,
  data: SubmissionSchema
) => {
  try {
    if (!data.id) {
      return {
        success: false,
        error: true,
        message: "Submission ID is required.",
      };
    }

    await prisma.submission.update({
      where: { id: parseInt(data.id) }, // Chuyển đổi thành số
      data: {
        fileUrl: data.fileUrl ?? null,
        note: data.note || null,
        submittedAt: new Date(),
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("❌ Error updating submission:", err);
    return {
      success: false,
      error: true,
      message: "Failed to update submission.",
    };
  }
};
export const deleteSubmission = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = parseInt(data.get("id") as string, 10);

  if (isNaN(id)) {
    return {
      success: false,
      error: true,
      message: "Invalid submission ID.",
    };
  }

  try {
    await prisma.submission.delete({
      where: { id },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("❌ Error deleting submission:", err);
    return {
      success: false,
      error: true,
      message: "Failed to delete submission.",
    };
  }
};

export const createLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  try {
    await prisma.lesson.create({
      data: {
        name: data.name,
        title: data.title,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
        description: data.description ?? null,
        content: data.content ?? null,
        fileUrl: data.fileUrl ?? null,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating lesson:", err);
    return { success: false, error: true, message: "Failed to create lesson." };
  }
};

export const updateLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  try {
    if (!data.id) {
      return { success: false, error: true, message: "Lesson ID is required." };
    }

    await prisma.lesson.update({
      where: { id: data.id },
      data: {
        name: data.name,
        title: data.title,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
        description: data.description ?? null,
        content: data.content ?? null,
        fileUrl: data.fileUrl ?? null,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating lesson:", err);
    return { success: false, error: true, message: "Failed to update lesson." };
  }
};

export const deleteLesson = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = parseInt(data.get("id") as string, 10);

  if (isNaN(id)) {
    return { success: false, error: true, message: "Invalid lesson ID." };
  }

  try {
    await prisma.lesson.delete({
      where: { id },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting lesson:", err);
    return { success: false, error: true, message: "Failed to delete lesson." };
  }
};

export const createResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  try {
    await prisma.result.create({
      data: {
        score: data.score,
        examId: data.examId || null, // Có thể không có examId
        assignmentId: data.assignmentId || null, // Có thể không có assignmentId
        studentId: data.studentId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// 📌 Hàm cập nhật kết quả (Result)
export const updateResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  try {
    await prisma.result.update({
      where: {
        id: data.id,
      },
      data: {
        score: data.score,
        examId: data.examId || null, // Cập nhật nếu có examId
        assignmentId: data.assignmentId || null, // Cập nhật nếu có assignmentId
        studentId: data.studentId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
export const deleteResult = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = parseInt(data.get("id") as string, 10);

  if (isNaN(id)) {
    return { success: false, error: true, message: "Invalid result ID." };
  }

  try {
    await prisma.result.delete({
      where: { id },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting result:", err);
    return { success: false, error: true, message: "Failed to delete result." };
  }
};

export const createCalendar = async (
  currentState: CurrentState,
  data: CalendarSchema
) => {
  try {
    await prisma.calendar.create({
      data: {
        teacherId: data.teacherId,
        classId: data.classId,
        startTime: data.startTime, // ✅ Không cần chuyển
        endTime: data.endTime,
        dayOfWeek: data.dayOfWeek, // Lưu lại ngày trong tuần
        subjects: {
          connect: data.subjectIds.map((id) => ({ id })), // Kết nối các môn học
        },
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const updateCalendar = async (
  currentState: CurrentState,
  data: CalendarSchema
) => {
  try {
    await prisma.calendar.update({
      where: {
        id: data.id, // Tìm theo ID của lịch đã tồn tại
      },
      data: {
        teacherId: data.teacherId,
        classId: data.classId,
        startTime: data.startTime, // ✅ Không cần chuyển
        endTime: data.endTime,
        dayOfWeek: data.dayOfWeek, // Cập nhật lại ngày trong tuần
        subjects: {
          set: data.subjectIds.map((id) => ({ id })), // Sử dụng `set` để thay thế môn học cũ
        },
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};
export const deleteCalendar = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  try {
    await prisma.calendar.delete({
      where: {
        id: parseInt(id), // Chuyển ID từ string sang số
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};
