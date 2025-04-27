import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";


// const ParentPage = async () => {
//   const { userId } = auth();
//   const currentUserId = userId;
  
//   const students = await prisma.student.findMany({
//     where: {
//       parentId: currentUserId!,
//     },
//   });

//   return (
//     <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
//       {/* LEFT */}
//       <div className="">
//         {students.map((student) => (
//           <div className="w-full xl:w-2/3" key={student.id}>
//             <div className="h-full bg-white p-4 rounded-md">
//               <h1 className="text-xl font-semibold">
//                 Schedule ({student.name + " " + student.surname})
//               </h1>
//               <BigCalendarContainer type="classId" id={student.classId} />
//             </div>
//           </div>
//         ))}
//       </div>
//       {/* RIGHT */}
//       <div className="w-full xl:w-1/3 flex flex-col gap-8">
//         <Announcements />
//       </div>
//     </div>
//   );
// };

// export default ParentPage;


const ParentPage = async () => {
  const { userId } = auth();

  // 1. If no user is logged in, handle it gracefully
  if (!userId) {
    return <div>Please log in to view your children’s schedules.</div>;
  }

  // 2. Find students who have this parentId
  const students = await prisma.student.findMany({
    where: { parentId: userId },
  });

  // 3. If no students found, handle or show a message
  if (!students || students.length === 0) {
    return <div>No students found for this parent.</div>;
  }

  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div>
        {students.map((student) => (
          <div className="w-full xl:w-2/3" key={student.id}>
            <div className="h-full bg-white p-4 rounded-md">
              <h1 className="text-xl font-semibold">
                Schedule ({student.name} {student.surname})
              </h1>
              <BigCalendarContainer type="classId" id={student.classId} />
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <Announcements />
      </div>
    </div>
  );
};

export default ParentPage;