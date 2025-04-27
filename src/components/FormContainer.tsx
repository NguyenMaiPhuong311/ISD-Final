import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { auth } from "@clerk/nextjs/server";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement"
    | "submission"
    | "calendar";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData = {};

  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  if (type !== "delete" ) {
    switch (table) {
      case "subject":
        const subjectTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: subjectTeachers };
        break;
      case "class":
        const classGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const classTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: classTeachers, grades: classGrades };
        break;
      case "teacher":
        const teacherSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        relatedData = { subjects: teacherSubjects };
        break;
      case "student":
        const studentGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const studentClasses = await prisma.class.findMany({
          include: { _count: { select: { students: true } } },
        });
        const studentParents = await prisma.parent.findMany({
          select: { id: true, name: true, surname: true }, // Chỉ lấy các trường cần thiết
      });
        relatedData = { classes: studentClasses, grades: studentGrades,parents: studentParents  };
        break;
      
        case "parent":
          const parentStudents = await prisma.student.findMany({
              select: { id: true, name: true, surname: true },
          });
      
          relatedData = { students: parentStudents };
          break;
      case "exam":
        const examLessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          select: { id: true, name: true },
        });
        relatedData = { lessons: examLessons };
        break;
        case "calendar":
          const calendarSubjects = await prisma.subject.findMany({
            select: { id: true, name: true },
          });
        
          const calendarTeachers = await prisma.teacher.findMany({
            select: { id: true, name: true, surname: true },
          });
        
          const calendarClasses = await prisma.class.findMany({
            select: { id: true, name: true },
          });
        
          relatedData = {
            subjects: calendarSubjects,
            teachers: calendarTeachers,
            classes: calendarClasses,
          };
          break;

      case "assignment":
          const assignmentLessons = await prisma.lesson.findMany({
            where: {
              ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
            },
            select: { id: true, name: true },
          });
          relatedData = { lessons: assignmentLessons };
          break;
          case "attendance":
            const attendanceStudents = await prisma.student.findMany({
              select: { id: true, name: true, surname: true, classId: true },
            });

            const attendanceClasses = await prisma.class.findMany({
              select: { id: true, name: true },
            });

            relatedData = {
              students: attendanceStudents,
              classes: attendanceClasses,
            };
            break;
          case "submission":
            const submissionAssignments = await prisma.assignment.findMany({
              select: { id: true, title: true },
          });
          
            const submissionStudents = await prisma.student.findMany({
              select: { id: true, name: true, surname: true },
          });
          
            relatedData = {
              assignments: submissionAssignments,
              students: submissionStudents,
            };
            break;
          
          
      case "announcement":
          const announcementClasses = await prisma.class.findMany({
            select: { id: true, name: true },
          });
          relatedData = { classes: announcementClasses };
          break;

      case "lesson":
          const lessonClasses = await prisma.class.findMany({
              include: { _count: { select: { students: true } } },
          });

          const lessonSubjects = await prisma.subject.findMany({
              select: { id: true, name: true },
          });

          const lessonTeachers = await prisma.teacher.findMany({
              select: { id: true, name: true, surname: true },
          });

          // Chỉ lấy các bài giảng của giáo viên hiện tại nếu role là "teacher"
          const lessonLessons = await prisma.lesson.findMany({
              where: {
                  ...(role === "teacher" ? { teacherId: currentUserId! } : {}), 
              },
              select: { id: true, name: true },
          });

          relatedData = { 
              classes: lessonClasses, 
              subjects: lessonSubjects, 
              teachers: lessonTeachers, 
              lessons: lessonLessons // Thêm lessons có điều kiện như assignment
          };
        break;

      case "result":
            const resultStudents = await prisma.student.findMany({
                select: { id: true, name: true, surname: true },
            });
        
            const resultExams = await prisma.exam.findMany({
                select: { id: true, title: true },
            });
        
            const resultAssignments = await prisma.assignment.findMany({
                select: { id: true, title: true },
            });
        
            relatedData = {
                students: resultStudents,
                exams: resultExams,
                assignments: resultAssignments,
            };
            break;

            
      default:
        break;
    }
  }

  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;
