// app/(dashboard)/list/profile/page.tsx
import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import PerformanceWrapper from "@/components/PerformanceWrapper";
import StudentAttendanceCard from "@/components/StudentAttendanceCard";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

const UserProfilePage = async () => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (!userId) return notFound();

  // ----------------- HỌC SINH -----------------
  if (role === "student") {
    const student = await prisma.student.findUnique({
      where: { id: userId },
      include: {
        class: {
          include: { _count: { select: { lessons: true } } },
        },
      },
    });

    if (!student) return notFound();

    return (
      <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
        {/* LEFT */}
        <div className="w-full xl:w-2/3">
          {/* INFO */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="bg-lamaSky py-6 px-4 rounded-md flex-1 flex gap-4">
              <Image
                src={student.img || "/noAvatar.png"}
                alt="avatar"
                width={144}
                height={144}
                className="w-36 h-36 rounded-full object-cover"
              />
              <div className="flex-1 flex flex-col justify-between gap-4">
                <h1 className="text-xl font-semibold">
                  {student.name} {student.surname}
                </h1>
                <div className="text-xs font-medium text-gray-500 flex flex-wrap gap-2">
                  <span>📧 {student.email || "-"}</span>
                  <span>📱 {student.phone || "-"}</span>
                  <span>🎂 {new Intl.DateTimeFormat("en-GB").format(student.birthday)}</span>
                  <span>🩸 {student.bloodType || "-"}</span>
                </div>
              </div>
            </div>
            <div className="flex-1 flex flex-wrap gap-4">
              <MiniCard title="Attendance" value={<StudentAttendanceCard id={student.id} />} icon="/singleAttendance.png" />
              <MiniCard title="Grade" value={student.class.name.charAt(0) + "th"} icon="/singleBranch.png" />
              <MiniCard title="Lessons" value={student.class._count.lessons} icon="/singleLesson.png" />
              <MiniCard title="Class" value={student.class.name} icon="/singleClass.png" />
            </div>
          </div>

          {/* CALENDAR */}
          <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
            <h1 className="font-semibold mb-2">Your Schedule</h1>
            <BigCalendarContainer type="classId" id={student.class.id} />
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-full xl:w-1/3 flex flex-col gap-4">
          <QuickLinks id={student.id} classId={student.class.id} role="student" />
          <PerformanceWrapper studentId={student.id} />
          <Announcements />
        </div>
      </div>
    );
  }

  // ----------------- GIÁO VIÊN -----------------
  if (role === "teacher") {
    const teacher = await prisma.teacher.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            subjects: true,
            lessons: true,
            classes: true,
          },
        },
      },
    });

    if (!teacher) return notFound();

    return (
      <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
        {/* LEFT */}
        <div className="w-full xl:w-2/3">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="bg-lamaSky py-6 px-4 rounded-md flex-1 flex gap-4">
              <Image
                src={teacher.img || "/noAvatar.png"}
                alt=""
                width={144}
                height={144}
                className="w-36 h-36 rounded-full object-cover"
              />
              <div className="flex-1 flex flex-col justify-between gap-4">
                <h1 className="text-xl font-semibold">
                  {teacher.name} {teacher.surname}
                </h1>
                <div className="text-xs font-medium text-gray-500 flex flex-wrap gap-2">
                  <span>📧 {teacher.email || "-"}</span>
                  <span>📱 {teacher.phone || "-"}</span>
                  <span>🎂 {new Intl.DateTimeFormat("en-GB").format(teacher.birthday)}</span>
                  <span>🩸 {teacher.bloodType || "-"}</span>
                </div>
              </div>
            </div>
            <div className="flex-1 flex flex-wrap gap-4">
              <MiniCard title="Attendance" value="90%" icon="/singleAttendance.png" />
              <MiniCard title="Subjects" value={teacher._count.subjects} icon="/singleBranch.png" />
              <MiniCard title="Lessons" value={teacher._count.lessons} icon="/singleLesson.png" />
              <MiniCard title="Classes" value={teacher._count.classes} icon="/singleClass.png" />
            </div>
          </div>

          {/* CALENDAR */}
          <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
            <h1 className="font-semibold mb-2">Your Teaching Schedule</h1>
            <BigCalendarContainer type="teacherId" id={teacher.id} />
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-full xl:w-1/3 flex flex-col gap-4">
          <QuickLinks id={teacher.id} role="teacher" />
          <Announcements />
        </div>
      </div>
    );
  }

  return notFound();
};

export default UserProfilePage;

// MINI CARD COMPONENT
const MiniCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: React.ReactNode;
  icon: string;
}) => (
  <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%]">
    <Image src={icon} alt="" width={24} height={24} />
    <div>
      <h1 className="text-xl font-semibold">{value}</h1>
      <span className="text-sm text-gray-400">{title}</span>
    </div>
  </div>
);

// QUICK LINKS COMPONENT
const QuickLinks = ({
  id,
  classId,
  role,
}: {
  id: string | number;
  classId?: number;
  role: "student" | "teacher";
}) => {
  const links =
    role === "student"
      ? [
          { href: `/list/lessons?classId=${classId}`, label: "Lessons" },
          { href: `/list/teachers?classId=${classId}`, label: "Teachers" },
          { href: `/list/exams?classId=${classId}`, label: "Exams" },
          { href: `/list/assignments?classId=${classId}`, label: "Assignments" },
          { href: `/list/results?studentId=${id}`, label: "Results" },
        ]
      : [
          { href: `/list/classes?supervisorId=${id}`, label: "Your Classes" },
          { href: `/list/students?teacherId=${id}`, label: "Your Students" },
          { href: `/list/lessons?teacherId=${id}`, label: "Your Lessons" },
          { href: `/list/exams?teacherId=${id}`, label: "Your Exams" },
          { href: `/list/assignments?teacherId=${id}`, label: "Your Assignments" },
        ];

  return (
    <div className="bg-white p-4 rounded-md">
      <h1 className="text-xl font-semibold">Quick Access</h1>
      <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="p-3 rounded-md bg-lamaSkyLight">
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
};



