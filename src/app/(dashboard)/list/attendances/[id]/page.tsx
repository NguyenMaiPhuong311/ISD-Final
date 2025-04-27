export const dynamic = "force-dynamic";

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Attendance } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

// ✅ Nhóm dữ liệu attendance theo ngày, trạng thái, capacity
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

  // Group lại theo ngày, trạng thái và capacity
  const grouped = attendances.reduce((acc, item) => {
    const dateKey = new Date(item.date).toLocaleDateString("en-CA");
    const key = `${dateKey}_${item.present}_${item.capacity}`;
    if (!acc[key]) {
      acc[key] = {
        id: item.id, // lấy id đầu tiên làm đại diện
        date: item.date,
        present: item.present,
        capacity: item.capacity,
        studentNames: item.student
          ? [`${item.student.name} ${item.student.surname}`]
          : [],
      };
    } else {
      if (item.student) {
        acc[key].studentNames.push(
          `${item.student.name} ${item.student.surname}`
        );
      }
    }
    return acc;
  }, {} as Record<string, AttendanceGroup>);

  const groupedRows = Object.values(grouped);

  const columns = [
    { header: "Student Names", accessor: "studentNames" },
    { header: "Capacity", accessor: "capacity" },
    {
      header: "Absent",
      accessor: "present",
      className: "hidden md:table-cell",
    },
    { header: "Date", accessor: "date", className: "hidden md:table-cell" },
    ...(role === "teacher" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (row: AttendanceGroup) => (
    <tr
      key={`${row.date.toISOString()}_${row.present}_${row.capacity}`}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">{row.studentNames.join(", ") || "No students"}</td>
      <td>{row.capacity}</td>
      <td className="hidden md:table-cell">{"Yes"}</td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US").format(new Date(row.date))}
      </td>
      {role === "teacher" && (
        <td>
          <div className="flex items-center gap-2">
            <FormContainer
              table="attendance"
              type="update"
              data={{
                id: row.id,
                date: row.date,
                present: row.present,
                capacity: row.capacity,
                classId: classId,
                studentIds: [], // Không cần truyền studentIds nếu không có học sinh
              }}
            />
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
        </td>
      )}
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">All Attendance Records</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "teacher" && (
              <FormContainer
                table="attendance"
                type="create"
                data={{ classId }}
              />
            )}
          </div>
        </div>
      </div>

      <Table columns={columns} renderRow={renderRow} data={groupedRows} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default AttendanceListPage;
