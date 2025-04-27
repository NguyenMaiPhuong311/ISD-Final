import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Prisma, Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

type ClassList = Class & { supervisor: Teacher };

const ClassListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    { header: "🏫 Class Name", accessor: "name" },
    { header: "👥 Capacity", accessor: "capacity", className: "hidden md:table-cell" },
    { header: "🎓 Grade", accessor: "grade", className: "hidden md:table-cell" },
    { header: "👩‍🏫 Supervisor", accessor: "supervisor", className: "hidden md:table-cell" },
    ...(role === "admin" || role === "teacher" || role === "student"
      ? [{ header: "⚙️ Actions", accessor: "action" }]
      : []),
  ];

  const renderRow = (item: ClassList) => (
    <tr
      key={item.id}
      className="border border-transparent hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg even:bg-slate-50 odd:bg-white text-sm transition-all duration-200"
    >
      <td className="p-4 font-semibold text-gray-800">{item.name}</td>
      <td className="hidden md:table-cell text-gray-700">{item.capacity}</td>
      <td className="hidden md:table-cell">
        <span className="inline-block px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700 font-medium">
          {item.name[0]}
        </span>
      </td>
      <td className="hidden md:table-cell text-gray-700">
        {item.supervisor.name} {item.supervisor.surname}
      </td>
      <td>
        <div className="flex items-center gap-2 px-2">
          {/* View Calendar */}
          <Link href={`/list/calendar/${item.id}`}>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-100 hover:bg-blue-300 hover:ring-2 hover:ring-blue-400 transition-all duration-300 shadow-md"
              title="View Calendar"
            >
              <Image
                src="/view.png"
                alt="view calendar"
                width={16}
                height={16}
                className="object-contain"
              />
            </button>
          </Link>

          {/* Admin Actions */}
          {role === "admin" && (
            <>
              <div
                className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-100 hover:bg-blue-300 hover:ring-2 hover:ring-blue-400 transition-all duration-300 shadow-md"
                title="Edit Class"
              >
                <FormContainer table="class" type="update" data={item} />
              </div>
              <div
                className="w-8 h-8 flex items-center justify-center rounded-md bg-red-100 hover:bg-red-300 hover:ring-2 hover:ring-red-400 transition-all duration-300 shadow-md"
                title="Delete Class"
              >
                <FormContainer table="class" type="delete" id={item.id} />
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.ClassWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "supervisorId":
            query.supervisorId = value;
            break;
          case "search":
            query.name = { contains: value, mode: "insensitive" };
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.class.findMany({
      where: query,
      include: {
        supervisor: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.class.count({ where: query }),
  ]);

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-purple-100 p-6 rounded-xl shadow-md flex-1 m-4 mt-0 font-sans">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-800">🏫 All Classes</h1>
          <p className="text-sm text-gray-500">View and manage class records</p>
        </div>
        {role === "admin" && <FormContainer table="class" type="create" />}
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

export default ClassListPage;
