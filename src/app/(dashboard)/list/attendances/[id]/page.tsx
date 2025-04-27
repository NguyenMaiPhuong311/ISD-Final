export const dynamic = "force-dynamic";

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Attendance } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

interface AttendanceGroup {
  id: number;
  date: Date;
  present: boolean;
  capacity: number;
  studentNames: string[];
}

const AttendanceListPage = async ({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | undefined };
}) => {
  const classId = parseInt(params.id);
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: any = { classId };

  for (const [key, value] of Object.entries(queryParams)) {
    if (value !== undefined) {
      switch (key) {
        case "studentId":
          query.studentId = value;
          break;
        case "search":
          query.student = {
            name: { contains: value, mode: "insensitive" },
          };
          break;
      }
    }
  }

  const [attendances, count] = await prisma.$transaction([
    prisma.attendance.findMany({
      where: query,
      include: {
        student: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.attendance.count({ where: query }),
  ]);

  const grouped = attendances.reduce((acc, item) => {
    const dateKey = new Date(item.date).toLocaleDateString("en-CA");
    const key = `${dateKey}_${item.present}_${item.capacity}`;
    if (!acc[key]) {
      acc[key] = {
        id: item.id,
        date: item.date,
        present: item.present,
        capacity: item.capacity,
        studentNames: [`${item.student.name} ${item.student.surname}`],
      };
    } else {
      acc[key].studentNames.push(
        `${item.student.name} ${item.student.surname}`
      );
    }
    return acc;
  }, {} as Record<string, AttendanceGroup>);

  const groupedRows = Object.values(grouped);

  const columns = [
    { header: "👨‍🎓 Student Names", accessor: "studentNames" },
    { header: "👥 Capacity", accessor: "capacity" },
    {
      header: "✅ Present",
      accessor: "present",
      className: "hidden md:table-cell",
    },
    { header: "📅 Date", accessor: "date", className: "hidden md:table-cell" },
    ...(role === "teacher" ? [{ header: "⚙️ Actions", accessor: "action" }] : []),
  ];

  const renderRow = (row: AttendanceGroup) => (
    <tr
      key={`${row.date.toISOString()}_${row.present}_${row.capacity}`}
      className="border border-transparent hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg even:bg-slate-50 odd:bg-white text-sm transition-all duration-200"
    >
      <td className="p-4 text-gray-800">{row.studentNames.join(", ")}</td>
      <td className="p-4 text-gray-700">{row.capacity}</td>
      <td className="hidden md:table-cell p-4 text-gray-700">
        {row.present ? "Yes" : "No"}
      </td>
      <td className="hidden md:table-cell p-4 text-gray-700">
        {new Intl.DateTimeFormat("en-US").format(new Date(row.date))}
      </td>
      {role === "teacher" && (
        <td className="p-4">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-100 hover:bg-blue-300 hover:ring-2 hover:ring-blue-400 transition-all duration-300 shadow-md"
              title="Edit Attendance"
            >
              <FormContainer
                table="attendance"
                type="update"
                data={{
                  id: row.id,
                  date: row.date,
                  present: row.present,
                  capacity: row.capacity,
                  classId: classId,
                  studentIds: [],
                }}
              />
            </div>
            <div
              className="w-8 h-8 flex items-center justify-center rounded-md bg-red-100 hover:bg-red-300 hover:ring-2 hover:ring-red-400 transition-all duration-300 shadow-md"
              title="Delete Attendance"
            >
              <FormContainer
                table="attendance"
                type="delete"
                data={{
                  date: row.date.toISOString(),
                  present: row.present,
                  capacity: row.capacity,
                  classId: classId,
                }}
              />
            </div>
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-purple-100 p-6 rounded-xl shadow-md flex-1 m-4 mt-0 font-sans">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-800">📅 All Attendance Records</h1>
          <p className="text-sm text-gray-500">Track and manage attendance by class</p>
        </div>

        {role === "teacher" && (
          <FormContainer table="attendance" type="create" data={{ classId }} />
        )}
      </div>

      {/* Table */}
      <Table columns={columns} renderRow={renderRow} data={groupedRows} />

      {/* Pagination */}
      <div className="mt-6">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default AttendanceListPage;
