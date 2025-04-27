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
        dayOfWeek: "asc", // Sắp xếp theo thứ trong tuần
      },
    }),
    prisma.calendar.count({ where: { classId } }),
  ]);

  const columns = [
    { header: "Day", accessor: "dayOfWeek" },
    { header: "Start Time", accessor: "startTime" },
    { header: "End Time", accessor: "endTime" },
    { header: "Teacher", accessor: "teacher" },
    { header: "Subjects", accessor: "subjects" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (calendar: CalendarWithDetails) => (
    <tr
      key={calendar.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">{calendar.dayOfWeek}</td>
      <td>
        {new Date(calendar.startTime) instanceof Date &&
        !isNaN(new Date(calendar.startTime).getTime())
          ? new Date(calendar.startTime).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone: "Asia/Ho_Chi_Minh",
            })
          : calendar.startTime}
      </td>
      <td>
        {new Date(calendar.endTime) instanceof Date &&
        !isNaN(new Date(calendar.endTime).getTime())
          ? new Date(calendar.endTime).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone: "Asia/Ho_Chi_Minh",
            })
          : calendar.endTime}
      </td>
      <td>
        {calendar.teacher.name} {calendar.teacher.surname}
      </td>
      <td>{calendar.subjects.map((s) => s.name).join(", ")}</td>
      <td>
        {role === "admin" && (
          <div className="flex gap-2">
            <FormContainer table="calendar" type="update" data={calendar} />
            <FormContainer table="calendar" type="delete" id={calendar.id} />
          </div>
        )}
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">
          Calendar for Class: {classData.name}
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && (
              <FormContainer
                table="calendar"
                type="create"
                data={{ classId }}
              />
            )}
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10 max-w-7xl mx-auto">
        <div className="bg-blue-50 px-4 py-3 rounded-lg shadow flex items-start gap-3 h-[80px]">
          <span className="text-xl mt-1">📅</span>
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

      {/* TABLE */}
      <Table columns={columns} renderRow={renderRow} data={calendars} />

      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default SingleCalendarPage;
