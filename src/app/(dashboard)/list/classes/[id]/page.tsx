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

// Kiểu dữ liệu StudentList kèm theo thông tin class
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

  // Lấy thông tin class
  const classData = await prisma.class.findUnique({
    where: { id: classId },
    include: { supervisor: true },
  });

  if (!classData) {
    return notFound(); // Nếu không tìm thấy class
  }

  // Lấy danh sách học sinh thuộc class đã chọn
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

  // Cấu hình các cột của bảng Student
  const columns = [
    {
      header: "Info",
      accessor: "info",
    },
    {
      header: "Student ID",
      accessor: "studentId",
      className: "hidden md:table-cell",
    },
    {
      header: "Grade",
      accessor: "grade",
      className: "hidden md:table-cell",
    },
    {
      header: "Phone",
      accessor: "phone",
      className: "hidden lg:table-cell",
    },
    {
      header: "Address",
      accessor: "address",
      className: "hidden lg:table-cell",
    },
    ...(role === "admin"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  // Render từng hàng dữ liệu học sinh
  const renderRow = (item: StudentList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.img || "/noAvatar.png"}
          alt="avatar"
          width={36}
          height={36}
          className="w-9 h-9 rounded-full"
        />
        <div>
          <p className="font-medium">{item.name}</p>
          <p className="text-xs text-gray-500">{item.class.name}</p>
        </div>
      </td>
      <td>{item.username}</td>
      <td>{item.class.name[0]}</td>
      <td>{item.phone || "-"}</td>
      <td>{item.address || "-"}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/students/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="View Icon" width={16} height={16} />
            </button>
          </Link>
          {role === "admin" && (
            <>
              <FormContainer table="student" type="update" data={item} />
              <FormContainer table="student" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* THÔNG TIN LỚP */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">
          Class: {classData.name} - Grade {classData.gradeId}
        </h1>
        {role === "admin" && (
          <FormContainer table="class" type="update" data={classData} />
        )}
      </div>

      <div className="text-sm text-gray-600 mb-6">
        <p>
          <strong>Capacity:</strong> {classData.capacity} Students
        </p>
        <p>
          <strong>Supervisor:</strong>{" "}
          {classData.supervisor?.name + " " + classData.supervisor?.surname}
        </p>
      </div>

      {/* DANH SÁCH HỌC SINH */}
      <Table columns={columns} renderRow={renderRow} data={students} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default ClassStudentPage;
