import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

type ResultList = {
  id: number;
  score: number;
  studentName: string;
  studentSurname: string;
  examTitle?: string;
  assignmentTitle?: string;
};

const ResultListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  const columns = [
    { header: "👤 Student", accessor: "student" },
    { header: "📊 Score", accessor: "score" },
    { header: "📝 Exam", accessor: "examTitle", className: "hidden md:table-cell" },
    { header: "📚 Assignment", accessor: "assignmentTitle", className: "hidden md:table-cell" },
    ...(role === "admin" || role === "teacher"
      ? [{ header: "⚙️ Actions", accessor: "action" }]
      : []),
  ];

  const renderRow = (item: ResultList) => (
    <tr
      key={item.id}
      className="border border-transparent hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg even:bg-slate-50 odd:bg-white text-sm transition-all duration-200"
    >
      <td className="p-4 font-medium text-gray-800">
        {item.studentName} {item.studentSurname}
      </td>
      <td className="hidden md:table-cell text-gray-700">{item.score}</td>
      <td className="hidden md:table-cell text-gray-700">{item.examTitle || "N/A"}</td>
      <td className="hidden md:table-cell text-gray-700">{item.assignmentTitle || "N/A"}</td>
      {(role === "admin" || role === "teacher") && (
        <td>
          <div className="flex items-center gap-2 px-2">
            <FormContainer table="result" type="update" data={item} />
            <FormContainer table="result" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.ResultWhereInput = {};
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "studentId":
            query.studentId = value;
            break;
          case "search":
            query.OR = [
              { exam: { title: { contains: value, mode: "insensitive" } } },
              { assignment: { title: { contains: value, mode: "insensitive" } } },
              { student: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
        }
      }
    }
  }

  switch (role) {
    case "admin":
      break;
    case "teacher":
      query.OR = [
        { exam: { lesson: { teacherId: currentUserId! } } },
        { assignment: { lesson: { teacherId: currentUserId! } } },
      ];
      break;
    case "student":
      query.studentId = currentUserId!;
      break;
    case "parent":
      query.student = { parentId: currentUserId! };
      break;
  }

  const [dataRes, count] = await prisma.$transaction([
    prisma.result.findMany({
      where: query,
      include: {
        student: { select: { name: true, surname: true } },
        exam: { select: { title: true } },
        assignment: { select: { title: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.result.count({ where: query }),
  ]);

  const data: ResultList[] = dataRes.map((item) => ({
    id: item.id,
    score: item.score,
    studentName: item.student.name,
    studentSurname: item.student.surname,
    examTitle: item.exam?.title || "",
    assignmentTitle: item.assignment?.title || "",
  }));

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-purple-100 p-6 rounded-xl shadow-md flex-1 m-4 mt-0 font-sans">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-800">📈 Student Results</h1>
          <p className="text-sm text-gray-500">View and manage performance records</p>
        </div>
        {(role === "admin" || role === "teacher") && (
          <FormContainer table="result" type="create" />
        )}
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

export default ResultListPage;
