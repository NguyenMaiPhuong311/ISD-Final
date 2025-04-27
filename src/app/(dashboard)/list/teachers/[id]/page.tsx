import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const SingleTeacherPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const teacher:
    | (Teacher & {
        _count: { subjects: number; lessons: number; classes: number };
      })
    | null = await prisma.teacher.findUnique({
    where: { id },
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

  if (!teacher) {
    return notFound();
  }
  return (
    <div className="flex-1 p-6 m-4 mt-0 bg-gradient-to-br from-white via-blue-50 to-purple-100 rounded-xl shadow-md font-sans flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3 flex flex-col gap-4">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* USER INFO CARD */}
          <div className="bg-white py-6 px-6 rounded-xl flex-1 flex gap-4 border border-slate-200 shadow-md hover:border-blue-500 hover:bg-blue-50 transition-all duration-300">
            <div className="w-1/3 flex justify-center items-center">
              <Image
                src={teacher.img || "/noAvatar.png"}
                alt="avatar"
                width={144}
                height={144}
                className="w-36 h-36 rounded-full object-cover border-2 border-blue-300 shadow-sm"
              />
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-blue-800">
                  {teacher.name + " " + teacher.surname}
                </h1>
                {role === "admin" && (
                  <FormContainer table="teacher" type="update" data={teacher} />
                )}
              </div>
              <p className="text-sm text-gray-500">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
              </p>

              {/* Thông tin chi tiết */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs text-gray-600 mt-2">
                <div className="flex items-center gap-2">
                  <Image src="/blood.png" alt="" width={14} height={14} className="min-w-[14px]" />
                  <span>{teacher.bloodType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image src="/date.png" alt="" width={14} height={14} className="min-w-[14px]" />
                  <span>{new Intl.DateTimeFormat("en-GB").format(teacher.birthday)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image src="/mail.png" alt="" width={14} height={14} className="min-w-[14px]" />
                  <span className="break-all">{teacher.email || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image src="/phone.png" alt="" width={14} height={14} className="min-w-[14px]" />
                  <span>{teacher.phone || "-"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SMALL CARDS */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            {/* Attendance */}
            <div className="bg-white p-5 rounded-xl flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] border border-slate-200 shadow-md hover:border-blue-500 hover:bg-blue-50 transition-all duration-300">
              <Image src="/singleAttendance.png" alt="" width={24} height={24} className="w-6 h-6" />
              <div>
                <h1 className="text-xl font-semibold">90%</h1>
                <span className="text-sm text-gray-400">Attendance</span>
              </div>
            </div>

            {/* Branches */}
            <div className="bg-white p-5 rounded-xl flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] border border-slate-200 shadow-md hover:border-blue-500 hover:bg-blue-50 transition-all duration-300">
              <Image src="/singleBranch.png" alt="" width={24} height={24} className="w-6 h-6" />
              <div>
                <h1 className="text-xl font-semibold">{teacher._count.subjects}</h1>
                <span className="text-sm text-gray-400">Branches</span>
              </div>
            </div>

            {/* Lessons */}
            <div className="bg-white p-5 rounded-xl flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] border border-slate-200 shadow-md hover:border-blue-500 hover:bg-blue-50 transition-all duration-300">
              <Image src="/singleLesson.png" alt="" width={24} height={24} className="w-6 h-6" />
              <div>
                <h1 className="text-xl font-semibold">{teacher._count.lessons}</h1>
                <span className="text-sm text-gray-400">Lessons</span>
              </div>
            </div>

            {/* Classes */}
            <div className="bg-white p-5 rounded-xl flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] border border-slate-200 shadow-md hover:border-blue-500 hover:bg-blue-50 transition-all duration-300">
              <Image src="/singleClass.png" alt="" width={24} height={24} className="w-6 h-6" />
              <div>
                <h1 className="text-xl font-semibold">{teacher._count.classes}</h1>
                <span className="text-sm text-gray-400">Classes</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="mt-4 bg-white p-6 rounded-xl h-[800px] border border-slate-200 shadow-md hover:border-blue-500 hover:bg-blue-50 transition-all duration-300">
          <h1 className="text-xl font-bold text-blue-800 mb-4">📅 Teacher's Schedule</h1>
          <BigCalendarContainer type="teacherId" id={teacher.id} />
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md hover:border-blue-500 hover:bg-blue-50 transition-all duration-300">
          <h1 className="text-xl font-bold text-blue-800 mb-4">🚀 Shortcuts</h1>
          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            <Link className="bg-lamaSkyLight p-3 rounded-md border border-gray-200 hover:brightness-110 hover:scale-105 transition-all duration-300" href={`/list/classes?supervisorId=${teacher.id}`}>
              Teacher's Classes
            </Link>
            <Link className="bg-lamaPurpleLight p-3 rounded-md border border-gray-200 hover:brightness-110 hover:scale-105 transition-all duration-300" href={`/list/students?teacherId=${teacher.id}`}>
              Teacher's Students
            </Link>
            <Link className="bg-lamaYellowLight p-3 rounded-md border border-gray-200 hover:brightness-110 hover:scale-105 transition-all duration-300" href={`/list/lessons?teacherId=${teacher.id}`}>
              Teacher's Lessons
            </Link>
            <Link className="bg-pink-50 p-3 rounded-md border border-gray-200 hover:brightness-110 hover:scale-105 transition-all duration-300" href={`/list/exams?teacherId=${teacher.id}`}>
              Teacher's Exams
            </Link>
            <Link className="bg-lamaSkyLight p-3 rounded-md border border-gray-200 hover:brightness-110 hover:scale-105 transition-all duration-300" href={`/list/assignments?teacherId=${teacher.id}`}>
              Teacher's Assignments
            </Link>
          </div>
        </div>

        {/* Announcements */}
        <Announcements />
      </div>
    </div>
  );
};

export default SingleTeacherPage;
