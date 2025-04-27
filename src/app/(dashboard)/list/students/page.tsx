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

type StudentList = Student & { class: Class };

const StudentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

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

  const renderRow = (item: StudentList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.img || "/noAvatar.png"}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">{item.class.name}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.username}</td>
      <td className="hidden md:table-cell">{item.class.name[0]}</td>
      <td className="hidden md:table-cell">{item.phone}</td>
      <td className="hidden md:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/students/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          {role === "admin" && (
            // <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaPurple">
            //   <Image src="/delete.png" alt="" width={16} height={16} />
            // </button>
            <FormContainer table="student" type="delete" id={item.id} />
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.StudentWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "teacherId":
            query.class = {
              lessons: {
                some: {
                  teacherId: value,
                },
              },
            };
            break;
          case "search":
            query.name = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.student.findMany({
      where: query,
      include: {
        class: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.student.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Students</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && (
              // <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              //   <Image src="/plus.png" alt="" width={14} height={14} />
              // </button>
              <FormContainer table="student" type="create" />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default StudentListPage;


// import FormContainer from "@/components/FormContainer";
// import Pagination from "@/components/Pagination";
// import Table from "@/components/Table";
// import prisma from "@/lib/prisma";
// import { ITEM_PER_PAGE } from "@/lib/settings";
// import { Class, Prisma, Student } from "@prisma/client";
// import Image from "next/image";
// import Link from "next/link";
// import { auth } from "@clerk/nextjs/server";

// type StudentList = Student & { class: Class };

// const StudentListPage = async ({
//   searchParams,
// }: {
//   searchParams: { [key: string]: string | undefined };
// }) => {
//   const { sessionClaims } = auth();
//   const role = (sessionClaims?.metadata as { role?: string })?.role;

//   const columns = [
//     { header: "Info", accessor: "info" },
//     { header: "Student ID", accessor: "studentId", className: "hidden md:table-cell" },
//     { header: "Grade", accessor: "grade", className: "hidden md:table-cell" },
//     { header: "Phone", accessor: "phone", className: "hidden lg:table-cell" },
//     { header: "Address", accessor: "address", className: "hidden lg:table-cell" },
//     ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
//   ];

//   const renderRow = (item: StudentList) => (
//     <tr
//       key={item.id}
//       className="group border-b border-gray-100 even:bg-slate-50 odd:bg-white 
//       hover:scale-105 hover:shadow-2xl hover:ring-2 hover:ring-blue-500 hover:bg-blue-50 
//       transition-all duration-300 rounded-xl"
//     >
//       <td className="flex items-center gap-4 p-4">
//         <Image
//           src={item.img || "/noAvatar.png"}
//           alt=""
//           width={40}
//           height={40}
//           className="w-10 h-10 rounded-full object-cover border-2 border-blue-300 shadow-sm"
//         />
//         <div className="flex flex-col">
//           <span className="font-semibold text-gray-800">{item.name}</span>
//           <span className="text-xs text-gray-500">{item.class.name}</span>
//         </div>
//       </td>
//       <td className="hidden md:table-cell text-gray-700">{item.username}</td>
//       <td className="hidden md:table-cell">
//         <span className="inline-block px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700 font-medium">
//           {item.class.name[0]}
//         </span>
//       </td>
//       <td className="hidden lg:table-cell text-gray-700">{item.phone}</td>
//       <td className="hidden lg:table-cell text-gray-700">{item.address}</td>
//       <td>
//         <div className="flex items-center gap-2 px-2">
//           {/* VIEW BUTTON */}
//           <Link href={`/list/students/${item.id}`}>
//             <button className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-100 
//               hover:bg-blue-300 hover:scale-110 hover:ring-2 hover:ring-blue-400 
//               transition-all duration-300 shadow-md">
//               <Image
//                 src="/view.png"
//                 alt="view"
//                 width={16}
//                 height={16}
//                 className="object-contain"
//               />
//             </button>
//           </Link>
// {/* DELETE BUTTON */}
//           {role === "admin" && (
//             <div className="w-8 h-8 rounded-md bg-red-100 
//               hover:bg-red-300 hover:scale-110 hover:ring-2 hover:ring-red-400 
//               flex items-center justify-center transition-all duration-300 shadow-md">
//               <FormContainer table="student" type="delete" id={item.id} />
//             </div>
//           )}
//         </div>
//       </td>
//     </tr>
//   );

//   const { page, ...queryParams } = searchParams;
//   const p = page ? parseInt(page) : 1;

//   const query: Prisma.StudentWhereInput = {};
//   if (queryParams) {
//     for (const [key, value] of Object.entries(queryParams)) {
//       if (value !== undefined) {
//         switch (key) {
//           case "teacherId":
//             query.class = {
//               lessons: {
//                 some: {
//                   teacherId: value,
//                 },
//               },
//             };
//             break;
//           case "search":
//             query.name = { contains: value, mode: "insensitive" };
//             break;
//         }
//       }
//     }
//   }

//   const [data, count] = await prisma.$transaction([
//     prisma.student.findMany({
//       where: query,
//       include: {
//         class: true,
//       },
//       take: ITEM_PER_PAGE,
//       skip: ITEM_PER_PAGE * (p - 1),
//     }),
//     prisma.student.count({ where: query }),
//   ]);

//   return (
//     <div className="bg-gradient-to-br from-white via-blue-50 to-purple-100 p-6 rounded-xl shadow-md flex-1 m-4 mt-0">
//       {/* Header */}
//       <div className="mb-6 flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-blue-800">Student Directory</h1>
//           <p className="text-sm text-gray-500">Explore and manage student records</p>
//         </div>
//         {role === "admin" && <FormContainer table="student" type="create" />}
//       </div>

//       {/* Table */}
//       <Table columns={columns} renderRow={renderRow} data={data} />

//       {/* Pagination */}
//       <div className="mt-6">
//         <Pagination page={p} count={count} />
//       </div>
//     </div>
//   );
// };

// export default StudentListPage;