import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Announcement, Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { CalendarDays, Megaphone } from "lucide-react";

type AnnouncementList = Announcement & {
  class: {
    name: string;
  };
};

const AnnouncementListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  const columns = [
    { header: "📢 Title", accessor: "title" },
    { header: "🏫 Class", accessor: "class" },
    { header: "📝 Description", accessor: "description" },
    {
      header: "📅 Date",
      accessor: "date",
      className: "hidden md:table-cell",
    },
    ...(role === "admin" ? [{ header: "⚙️ Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: AnnouncementList) => (
    <tr
      key={item.id}
      className="border border-transparent hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg even:bg-slate-50 odd:bg-white text-sm transition-all duration-200"
    >
      <td className="p-4 font-semibold text-gray-800 flex items-center gap-2">
        <Megaphone className="w-4 h-4 text-blue-500" />
        {item.title}
      </td>
      <td className="text-gray-700 p-2">{item.class?.name || "-"}</td>
      <td className="text-gray-700 max-w-xs p-2 line-clamp-3 whitespace-pre-wrap break-words">
        {item.description || "-"}
      </td>
      <td className="hidden md:table-cell text-gray-500 text-sm p-2">
        <div className="flex items-center gap-1">
          <CalendarDays className="w-4 h-4 text-gray-400" />
          {new Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(item.date)}
        </div>
      </td>
      <td className="p-2">
        {(role === "admin" || role === "teacher") && (
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-100 hover:bg-blue-300 hover:ring-2 hover:ring-blue-400 transition-all duration-300 shadow-md"
              title="Edit Announcement"
            >
              <FormContainer table="announcement" type="update" data={item} />
            </div>
            <div
              className="w-8 h-8 flex items-center justify-center rounded-md bg-red-100 hover:bg-red-300 hover:ring-2 hover:ring-red-400 transition-all duration-300 shadow-md"
              title="Delete Announcement"
            >
              <FormContainer table="announcement" type="delete" id={item.id} />
            </div>
          </div>
        )}
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.AnnouncementWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.classId = parseInt(value);
            break;
          case "search":
            query.title = { contains: value, mode: "insensitive" };
            break;
        }
      }
    }
  }

  switch (role) {
    case "teacher":
      query.class = {
        lessons: { some: { teacherId: currentUserId! } },
      };
      break;
    case "student":
      query.class = {
        students: { some: { id: currentUserId! } },
      };
      break;
    case "parent":
      query.class = {
        students: { some: { parentId: currentUserId! } },
      };
      break;
  }

  const [data, count] = await prisma.$transaction([
    prisma.announcement.findMany({
      where: query,
      include: {
        class: { select: { name: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.announcement.count({ where: query }),
  ]);

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-purple-100 p-6 rounded-xl shadow-md flex-1 m-4 mt-0 font-sans">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-800">📢 Announcements</h1>
          <p className="text-sm text-gray-500">Latest notices and updates for classes</p>
        </div>
        {(role === "admin" || role === "teacher") && (
          <FormContainer table="announcement" type="create" />
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

export default AnnouncementListPage;
