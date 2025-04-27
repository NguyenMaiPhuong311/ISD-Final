import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Lesson, Prisma, Subject, Teacher } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

type LessonList = Lesson & {
  subject: Subject;
  class: Class;
  teacher: Teacher;
};

const LessonListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    { header: "📚 Lesson Name", accessor: "name" },
    { header: "📝 Title", accessor: "title" },
    { header: "📖 Description", accessor: "description" },
    { header: "🗒️ Note", accessor: "content" },
    { header: "📅 Day", accessor: "day" },
    { header: "🏫 Class", accessor: "class" },
    { header: "🎓 Subject", accessor: "subject" },
    { header: "👩‍🏫 Teacher", accessor: "teacher" },
    { header: "📎 File", accessor: "file" },
    ...(role === "admin" || role === "teacher"
      ? [{ header: "⚙️ Actions", accessor: "action" }]
      : []),
  ];

  const renderRow = (item: LessonList) => (
    <tr
      key={item.id}
      className="border border-transparent hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg even:bg-slate-50 odd:bg-white text-sm transition-all duration-200"
    >
      <td className="p-2 font-medium text-gray-800">{item.name}</td>
      <td className="p-2 text-gray-700">{item.title}</td>
      <td className="p-2 text-gray-700">{item.description}</td>
      <td className="p-2 text-gray-700">{item.content}</td>
      <td className="p-2 text-gray-700">{item.day}</td>
      <td className="p-2 text-gray-700">{item.class.name}</td>
      <td className="p-2 text-gray-700">{item.subject.name}</td>
      <td className="p-2 text-gray-700">
        {item.teacher.name + " " + item.teacher.surname}
      </td>
      <td className="p-2">
        {item.fileUrl ? (
          <a
            href={item.fileUrl}
            target="_blank"
            className="text-blue-500 underline hover:text-blue-700 transition"
          >
            View File
          </a>
        ) : (
          <span className="text-gray-400 italic">No File</span>
        )}
      </td>
      <td className="p-2">
        {(role === "teacher" || role === "admin") && (
          <div className="flex items-center gap-2">
            <div
              title="Edit Lesson"
              className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-100 hover:bg-blue-300 hover:ring-2 hover:ring-blue-400 transition-all duration-300 shadow-md"
            >
              <FormContainer table="lesson" type="update" data={item} />
            </div>
            <div
              title="Delete Lesson"
              className="w-8 h-8 flex items-center justify-center rounded-md bg-red-100 hover:bg-red-300 hover:ring-2 hover:ring-red-400 transition-all duration-300 shadow-md"
            >
              <FormContainer table="lesson" type="delete" id={item.id} />
            </div>
          </div>
        )}
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.LessonWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.classId = parseInt(value);
            break;
          case "teacherId":
            query.teacherId = value;
            break;
          case "search":
            query.OR = [
              { name: { contains: value, mode: "insensitive" } },
              { title: { contains: value, mode: "insensitive" } },
              { description: { contains: value, mode: "insensitive" } },
              { content: { contains: value, mode: "insensitive" } },
              { subject: { name: { contains: value, mode: "insensitive" } } },
              { teacher: { name: { contains: value, mode: "insensitive" } } },
              { teacher: { surname: { contains: value, mode: "insensitive" } } },
            ];
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.lesson.findMany({
      where: query,
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true } },
        teacher: { select: { name: true, surname: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.lesson.count({ where: query }),
  ]);

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-purple-100 p-6 rounded-xl shadow-md flex-1 m-4 mt-0 font-sans">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-800">📚 All Lessons</h1>
          <p className="text-sm text-gray-500">List of lessons and learning materials</p>
        </div>
        {(role === "teacher" || role === "admin") && (
          <FormContainer table="lesson" type="create" />
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

export default LessonListPage;
