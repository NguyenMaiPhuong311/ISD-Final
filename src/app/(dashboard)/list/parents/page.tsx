import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Parent, Prisma, Student } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

type ParentList = Parent & { students: Student[] };

const ParentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    { header: "👤 Info", accessor: "info" },
    { header: "🎓 Student Names", accessor: "students", className: "hidden md:table-cell" },
    { header: "📞 Phone", accessor: "phone", className: "hidden lg:table-cell" },
    { header: "🏠 Address", accessor: "address", className: "hidden lg:table-cell" },
    ...(role === "admin" ? [{ header: "⚙️ Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: ParentList) => (
    <tr
      key={item.id}
      className="border border-transparent hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg even:bg-slate-50 odd:bg-white text-sm transition-all duration-200"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold text-gray-800">{item.name}</h3>
          <p className="text-xs text-gray-500">{item?.email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell text-gray-700">
        {item.students.map((student) => student.name).join(", ")}
      </td>
      <td className="hidden lg:table-cell text-gray-700">{item.phone}</td>
      <td className="hidden lg:table-cell text-gray-700">{item.address}</td>
      <td>
        <div className="flex items-center gap-2 px-2">
          {role === "admin" && (
            <>
              <div
                title="Edit Parent"
                className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-100 hover:bg-blue-300 hover:ring-2 hover:ring-blue-400 transition-all duration-300 shadow-md"
              >
                <FormContainer table="parent" type="update" data={item} />
              </div>
              <div
                title="Delete Parent"
                className="w-8 h-8 flex items-center justify-center rounded-md bg-red-100 hover:bg-red-300 hover:ring-2 hover:ring-red-400 transition-all duration-300 shadow-md"
              >
                <FormContainer table="parent" type="delete" id={item.id} />
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.ParentWhereInput = {};
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && key === "search") {
        query.name = { contains: value, mode: "insensitive" };
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.parent.findMany({
      where: query,
      include: {
        students: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.parent.count({ where: query }),
  ]);

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-purple-100 p-6 rounded-xl shadow-md flex-1 m-4 mt-0 font-sans">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-800">👨‍👩‍👧‍👦 All Parents</h1>
          <p className="text-sm text-gray-500">Manage and explore parent records</p>
        </div>
        {role === "admin" && <FormContainer table="parent" type="create" />}
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

export default ParentListPage;
