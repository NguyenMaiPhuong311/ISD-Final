import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Assignment, Class, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

type AssignmentList = Assignment & {
  lesson: {
    subject: Subject;
    class: Class;
    teacher: Teacher;
  };
};

const AssignmentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  const columns = [
    { header: "📝 Assignment Title", accessor: "title" },
    { header: "📚 Subject", accessor: "subject" },
    { header: "🏫 Class", accessor: "class" },
    { header: "👩‍🏫 Teacher", accessor: "teacher" },
    { header: "📅 Due Date", accessor: "dueDate" },
    { header: "📎 File", accessor: "file" },
    ...(role === "admin" || role === "teacher" || role === "student"
      ? [{ header: "⚙️ Actions", accessor: "action" }]
      : []),
  ];

  const renderRow = (item: AssignmentList) => (
    <tr
      key={item.id}
      className="border border-transparent hover:border-blue-400 hover:bg-blue-50 hover:shadow-md even:bg-slate-50 odd:bg-white text-sm transition-all duration-200"
    >
      <td className="p-2 font-semibold text-gray-800">{item.title}</td>
      <td className="p-2 text-gray-700">{item.lesson.subject.name}</td>
      <td className="p-2 text-gray-700">{item.lesson.class.name}</td>
      <td className="p-2 text-gray-700">
        {item.lesson.teacher.name} {item.lesson.teacher.surname}
      </td>
      <td className="p-2 text-gray-700">
        {new Intl.DateTimeFormat("en-US").format(item.dueDate)}
      </td>
      <td className="p-2">
        {item.fileUrl ? (
          <a
            href={item.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800 transition"
          >
            View File
          </a>
        ) : (
          <span className="italic text-gray-400">No File</span>
        )}
      </td>
      <td className="p-2">
        <div className="flex items-center gap-2">
          {(role === "teacher" || role === "admin" || role === "student") && (
            <Link href={`/list/assignments/${item.id}`}>
              <button className="px-4 py-2 bg-blue-100 text-blue-800 font-semibold rounded-md hover:bg-blue-300 hover:ring-2 hover:ring-blue-400 transition-all duration-300">
                View
              </button>
            </Link>
          )}
          {role === "teacher" && (
            <>
              <FormContainer table="assignment" type="update" data={item} />
              <FormContainer table="assignment" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: any = {
    lesson: {},
  };

  for (const [key, value] of Object.entries(queryParams)) {
    if (!value) continue;

    switch (key) {
      case "classId":
        query.lesson.classId = parseInt(value);
        break;
      case "teacherId":
        query.lesson.teacherId = value;
        break;
      case "search":
        query.lesson.subject = {
          name: { contains: value, mode: "insensitive" },
        };
        break;
    }
  }

  switch (role) {
    case "teacher":
      query.lesson.teacherId = currentUserId!;
      break;
    case "student":
      query.lesson.class = {
        students: { some: { id: currentUserId! } },
      };
      break;
    case "parent":
      query.lesson.class = {
        students: { some: { parentId: currentUserId! } },
      };
      break;
  }

  const [data, count] = await prisma.$transaction([
    prisma.assignment.findMany({
      where: query,
      include: {
        lesson: {
          include: {
            subject: true,
            class: true,
            teacher: true,
          },
        },
      },
      orderBy: { dueDate: "desc" },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.assignment.count({ where: query }),
  ]);

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-purple-100 p-6 rounded-xl shadow-md flex-1 m-4 mt-0 font-sans">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-800">📝 All Assignments</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-100 hover:bg-yellow-300 hover:ring-2 hover:ring-yellow-400 transition">
              <Image src="/filter.png" alt="Filter" width={16} height={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-100 hover:bg-yellow-300 hover:ring-2 hover:ring-yellow-400 transition">
              <Image src="/sort.png" alt="Sort" width={16} height={16} />
            </button>
            {role === "teacher" && (
              <FormContainer table="assignment" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* Pagination */}
      <div className="mt-6">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default AssignmentListPage;
