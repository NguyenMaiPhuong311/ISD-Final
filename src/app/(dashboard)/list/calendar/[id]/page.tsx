import dynamic from "next/dynamic";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Calendar, Class, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import FormContainer from "@/components/FormContainer";

type CalendarWithDetails = Calendar & {
  class: Class;
  teacher: Teacher;
  subjects: Subject[];
};

const SingleCalendarPage = async ({
  params: { id },
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | undefined };
}) => {
  const classId = parseInt(id);
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const classData = await prisma.class.findUnique({
    where: { id: classId },
  });

  if (!classData) return notFound();

  const { page } = searchParams;
  const p = page ? parseInt(page) : 1;

  const [calendars, count] = await prisma.$transaction([
    prisma.calendar.findMany({
      where: { classId },
      include: {
        class: true,
        teacher: true,
        subjects: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: {
        dayOfWeek: "asc",
      },
    }),
    prisma.calendar.count({ where: { classId } }),
  ]);

  const columns = [
    { header: "📅 Day", accessor: "dayOfWeek" },
    { header: "🕐 Start Time", accessor: "startTime" },
    { header: "🕑 End Time", accessor: "endTime" },
    { header: "👩‍🏫 Teacher", accessor: "teacher" },
    { header: "📚 Subjects", accessor: "subjects" },
    ...(role === "admin" ? [{ header: "⚙️ Actions", accessor: "action" }] : []),
  ];

  const renderRow = (calendar: CalendarWithDetails) => (
    <tr
      key={calendar.id}
      className="border border-transparent hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg even:bg-slate-50 odd:bg-white text-sm transition-all duration-200"
    >
      <td className="p-4">{calendar.dayOfWeek}</td>
      <td className="p-4">
        {typeof calendar.startTime === "string"
          ? calendar.startTime
          : calendar.startTime.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone: "Asia/Ho_Chi_Minh",
            })}
      </td>
      <td className="p-4">
        {typeof calendar.endTime === "string"
          ? calendar.endTime
          : calendar.endTime.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone: "Asia/Ho_Chi_Minh",
            })}
      </td>
      <td className="p-4">{calendar.teacher.name} {calendar.teacher.surname}</td>
      <td className="p-4">{calendar.subjects.map((s) => s.name).join(", ")}</td>
      <td className="p-4">
        {role === "admin" && (
          <div className="flex gap-2">
            <div className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-100 hover:bg-blue-300 hover:ring-2 hover:ring-blue-400 transition-all duration-300 shadow-md" title="Edit Calendar">
              <FormContainer table="calendar" type="update" data={calendar} />
            </div>
            <div className="w-8 h-8 flex items-center justify-center rounded-md bg-red-100 hover:bg-red-300 hover:ring-2 hover:ring-red-400 transition-all duration-300 shadow-md" title="Delete Calendar">
              <FormContainer table="calendar" type="delete" id={calendar.id} />
            </div>
          </div>
        )}
      </td>
    </tr>
  );

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-purple-100 p-6 rounded-xl shadow-md flex-1 m-4 mt-0 font-sans">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-800">
            📅 Calendar for Class: {classData.name}
          </h1>
          <p className="text-sm text-gray-500">
            View and manage schedule of {classData.name}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <TableSearch />
          {role === "admin" && (
            <FormContainer table="calendar" type="create" data={{ classId }} />
          )}
        </div>
      </div>

      {/* Class Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10 max-w-7xl mx-auto">
        <div className="bg-blue-50 px-4 py-3 rounded-lg shadow flex items-start gap-3 h-[80px]">
          <span className="text-xl mt-1">📘</span>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Class Name
            </p>
            <h2 className="text-sm font-bold text-blue-900">
              {classData.name}
            </h2>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table columns={columns} renderRow={renderRow} data={calendars} />

      {/* Pagination */}
      <div className="mt-6">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default SingleCalendarPage;
