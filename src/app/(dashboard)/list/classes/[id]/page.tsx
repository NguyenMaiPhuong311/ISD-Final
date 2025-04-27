import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";

import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Prisma, Student } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

type StudentList = Student & { class: Class };

const ClassStudentPage = async ({
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
    include: { supervisor: true },
  });

  if (!classData) {
    return notFound();
  }

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const [students, count] = await prisma.$transaction([
    prisma.student.findMany({
      where: { classId: classId },
      include: { class: true },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.student.count({ where: { classId: classId } }),
  ]);

  const columns = [
    { header: "👤 Info", accessor: "info" },
    { header: "🆔 Student ID", accessor: "studentId", className: "hidden md:table-cell" },
    { header: "🎓 Grade", accessor: "grade", className: "hidden md:table-cell" },
    { header: "📞 Phone", accessor: "phone", className: "hidden lg:table-cell" },
    { header: "🏠 Address", accessor: "address", className: "hidden lg:table-cell" },
    ...(role === "admin"
      ? [{ header: "⚙️ Actions", accessor: "action" }]
      : []),
  ];

  const renderRow = (item: StudentList) => (
    <tr
      key={item.id}
      className="border border-transparent hover:border-blue-400 hover:bg-blue-50 hover:shadow-md even:bg-slate-50 odd:bg-white text-sm transition-all duration-200"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.img || "/noAvatar.png"}
          alt="avatar"
          width={36}
          height={36}
          className="w-9 h-9 rounded-full object-cover"
        />
        <div>
          <p className="font-medium text-gray-800">{item.name}</p>
          <p className="text-xs text-gray-500">{item.class.name}</p>
        </div>
      </td>
      <td className="hidden md:table-cell text-gray-700">{item.username}</td>
      <td className="hidden md:table-cell text-gray-700">{item.class.name[0]}</td>
      <td className="hidden lg:table-cell text-gray-700">{item.phone || "-"}</td>
      <td className="hidden lg:table-cell text-gray-700">{item.address || "-"}</td>
      <td className="p-2">
        <div className="flex items-center gap-2">
          <Link href={`/list/students/${item.id}`}>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-100 hover:bg-blue-300 hover:ring-2 hover:ring-blue-400 transition-all duration-300 shadow-md"
              title="View Student"
            >
              <Image src="/view.png" alt="View Icon" width={16} height={16} />
            </button>
          </Link>
          {role === "admin" && (
            <>
              <div
                className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-100 hover:bg-blue-300 hover:ring-2 hover:ring-blue-400 transition-all duration-300 shadow-md"
                title="Edit Student"
              >
                <FormContainer table="student" type="update" data={item} />
              </div>
              <div
                className="w-8 h-8 flex items-center justify-center rounded-md bg-red-100 hover:bg-red-300 hover:ring-2 hover:ring-red-400 transition-all duration-300 shadow-md"
                title="Delete Student"
              >
                <FormContainer table="student" type="delete" id={item.id} />
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-purple-100 p-6 rounded-xl shadow-md flex-1 m-4 mt-0 font-sans">
      {/* Class Info */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-blue-800">
            🏫 Class: {classData.name} - Grade {classData.gradeId}
          </h1>
          {role === "admin" && (
            <FormContainer table="class" type="update" data={classData} />
          )}
        </div>
        <div className="text-sm text-gray-600">
          <p><strong>👥 Capacity:</strong> {classData.capacity} Students</p>
          <p><strong>👩‍🏫 Supervisor:</strong> {classData.supervisor?.name} {classData.supervisor?.surname}</p>
        </div>
      </div>

      {/* Students Table */}
      <Table columns={columns} renderRow={renderRow} data={students} />

      {/* Pagination */}
      <div className="mt-6">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default ClassStudentPage;
