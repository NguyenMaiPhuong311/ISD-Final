import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Submission, Assignment, Class, Subject, Teacher, Student } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

type SubmissionList = Submission & {
  assignment: {
    title: string;
    lesson: {
      subject: Subject;
      class: Class;
      teacher: Teacher;
    };
  };
  student: {
    name: string;
    surname: string;
  };
};

const SingleAssignmentPage = async ({
  params: { id },
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | undefined };
}) => {
  const assignmentId = parseInt(id);
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      lesson: {
        include: {
          subject: true,
          class: true,
          teacher: true,
        },
      },
    },
  });

  if (!assignment) return notFound();

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const [submissions, count] = await prisma.$transaction([
    prisma.submission.findMany({
      where: { assignmentId: assignmentId },
      include: {
        assignment: {
          include: {
            lesson: {
              include: {
                subject: true,
                class: true,
                teacher: true,
              },
            },
          },
        },
        student: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.submission.count({ where: { assignmentId: assignmentId } }),
  ]);

  const columns = [
    { header: "Student Name", accessor: "studentName" },
    { header: "File", accessor: "fileUrl" },
    { header: "Note", accessor: "note" },
    {
      header: "Submitted At",
      accessor: "submittedAt",
      className: "hidden md:table-cell",
    },
    ...(role === "student"
      ? [{ header: "Actions", accessor: "action" }]
      : []),
  ];

  const renderRow = (item: SubmissionList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        {item.student.name + " " + item.student.surname}
      </td>
      <td>
        {item.fileUrl ? (
          <a
            href={item.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lamaSky underline"
          >
            View File
          </a>
        ) : (
          "No File"
        )}
      </td>
      <td>{item.note || "No note"}</td>
      <td className="hidden md:table-cell">
        <span
          className={
            new Date(item.submittedAt) > new Date(assignment.dueDate)
              ? "text-red-600 font-medium"
              : ""
          }
          title={
            new Date(item.submittedAt) > new Date(assignment.dueDate)
              ? "Late submission"
              : "On time"
          }
        >
          {new Intl.DateTimeFormat("en-US").format(new Date(item.submittedAt))}
        </span>
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === "student" && (
            <>
              <FormContainer table="submission" type="update" data={item} />
              <FormContainer table="submission" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Assignment: {assignment.title}</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "student" && (
              <FormContainer table="submission" type="create" />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10 max-w-7xl mx-auto">
        {/* Assignment Info Cards */}
        <div className="bg-blue-50 px-4 py-3 rounded-lg shadow flex items-start gap-3 h-[80px]">
          <span className="text-xl mt-1">📄</span>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Assignment</p>
            <h2 className="text-sm font-bold text-blue-900">{assignment.title}</h2>
          </div>
        </div>

        <div className="bg-yellow-50 px-4 py-3 rounded-lg shadow flex items-start gap-3 h-[80px]">
          <span className="text-xl mt-1">📘</span>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Subject</p>
            <h2 className="text-sm font-bold text-yellow-900">{assignment.lesson.subject.name}</h2>
          </div>
        </div>

        <div className="bg-blue-50 px-4 py-3 rounded-lg shadow flex items-start gap-3 h-[80px]">
          <span className="text-xl mt-1">📅</span>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Due Date</p>
            <h2 className="text-sm font-bold text-blue-900">
              {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(assignment.dueDate))}
            </h2>
          </div>
        </div>

        <div className="bg-yellow-50 px-4 py-3 rounded-lg shadow flex items-start gap-3 h-[80px]">
          <span className="text-xl mt-1">👩‍🏫</span>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Teacher</p>
            <h2 className="text-sm font-bold text-yellow-900">
              {assignment.lesson.teacher.name} {assignment.lesson.teacher.surname}
            </h2>
          </div>
        </div>

        <div className="bg-blue-50 px-4 py-3 rounded-lg shadow flex items-start gap-3 h-[80px]">
          <span className="text-xl mt-1">🏫</span>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Class</p>
            <h2 className="text-sm font-bold text-blue-900">{assignment.lesson.class.name}</h2>
          </div>
        </div>

        <div className="bg-yellow-50 px-4 py-3 rounded-lg shadow flex items-start gap-3 h-[80px]">
          <span className="text-xl mt-1">📎</span>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Attached File</p>
            {assignment.fileUrl ? (
              <a href={assignment.fileUrl} target="_blank" className="text-blue-600 font-semibold underline text-sm">
                View File
              </a>
            ) : (
              <p className="text-sm text-gray-400">No file uploaded</p>
            )}
          </div>
        </div>
      </div>

      <Table columns={columns} renderRow={renderRow} data={submissions} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default SingleAssignmentPage;
