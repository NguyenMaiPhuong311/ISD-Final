import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import prisma from "@/lib/prisma";
import { Class, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";

type TeacherList = Teacher & { subjects: Subject[] } & { classes: Class[] };

const TeacherListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    { header: "👤 Info", accessor: "info" },
    { header: "🆔 Teacher ID", accessor: "teacherId", className: "hidden md:table-cell" },
    { header: "📚 Subjects", accessor: "subjects", className: "hidden md:table-cell" },
    { header: "🏫 Classes", accessor: "classes", className: "hidden md:table-cell" },
    { header: "📞 Phone", accessor: "phone", className: "hidden lg:table-cell" },
    { header: "🏠 Address", accessor: "address", className: "hidden lg:table-cell" },
    ...(role === "admin" ? [{ header: "⚙️ Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: TeacherList) => (
    <tr
      key={item.id}
      className="border border-transparent hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg even:bg-slate-50 odd:bg-white text-sm transition-all duration-200"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.img || "/noAvatar.png"}
          alt=""
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover border-2 border-blue-300 shadow-sm"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold text-gray-800">{item.name}</h3>
          <p className="text-xs text-gray-500">{item?.email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell text-gray-700">{item.username}</td>
      <td className="hidden md:table-cell text-gray-700">
        {item.subjects.map((subject) => subject.name).join(", ")}
      </td>
      <td className="hidden md:table-cell text-gray-700">
        {item.classes.map((cls) => cls.name).join(", ")}
      </td>
      <td className="hidden md:table-cell text-gray-700">{item.phone}</td>
      <td className="hidden md:table-cell text-gray-700">{item.address}</td>
      <td>
        <div className="flex items-center gap-2 px-2">
          <Link href={`/list/teachers/${item.id}`}>
            <button
              title="View Teacher"
              className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-100 
              hover:bg-blue-300 hover:ring-2 hover:ring-blue-400 transition-all duration-300 shadow-md"
            >
              <Image
                src="/view.png"
                alt="view"
                width={16}
                height={16}
                className="object-contain"
              />
            </button>
          </Link>

          {role === "admin" && (
            <div
              title="Delete Teacher"
              className="w-8 h-8 rounded-md bg-red-100 
              hover:bg-red-300 hover:ring-2 hover:ring-red-400 
              flex items-center justify-center transition-all duration-300 shadow-md"
            >
              <FormContainer table="teacher" type="delete" id={item.id} />
            </div>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.TeacherWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.lessons = {
              some: {
                classId: parseInt(value),
              },
            };
            break;
          case "search":
            query.name = { contains: value, mode: "insensitive" };
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.teacher.findMany({
      where: query,
      include: {
        subjects: true,
        classes: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.teacher.count({ where: query }),
  ]);

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-purple-100 p-6 rounded-xl shadow-md flex-1 m-4 mt-0 font-sans">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-800">👩‍🏫 All Teachers</h1>
          <p className="text-sm text-gray-500">Manage and explore teacher profiles</p>
        </div>
        {role === "admin" && <FormContainer table="teacher" type="create" />}
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

export default TeacherListPage;
