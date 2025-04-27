import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import BigCalendar from "@/components/BigCalender";
import EventCalendar from "@/components/EventCalendar";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// const StudentPage = async () => {
//   const { userId } = auth();

//   const classItem = await prisma.class.findMany({
//     where: {
//       students: { some: { id: userId! } },
//     },
//   });

//   console.log(classItem);
//   return (
//     <div className="p-4 flex gap-4 flex-col xl:flex-row">
//       {/* LEFT */}
//       <div className="w-full xl:w-2/3">
//         <div className="h-full bg-white p-4 rounded-md">
//           <h1 className="text-xl font-semibold">Schedule (4A)</h1>
//           <BigCalendarContainer type="classId" id={classItem[0].id} />
//         </div>
//       </div>
//       {/* RIGHT */}
//       <div className="w-full xl:w-1/3 flex flex-col gap-8">
//         <EventCalendar />
//         <Announcements />
//       </div>
//     </div>
//   );
// };

// export default StudentPage;


const StudentPage = async () => {
  const { userId } = auth();

  // If there's no user, handle it gracefully
  if (!userId) {
    // For example, redirect, throw an error, or return an empty UI
    return <div>No user logged in</div>;
  }

  const classItem = await prisma.class.findMany({
    where: {
      students: {
        some: {
          id: userId, // pass userId directly, no `!`
        },
      },
    },
  });

  // If the user is logged in but has no classes
  if (!classItem || classItem.length === 0) {
    return <div>No classes found</div>;
  }

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Schedule (4A)</h1>
          <BigCalendarContainer type="classId" id={classItem[0].id} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <EventCalendar />
        <Announcements />
      </div>
    </div>
  );
};

export default StudentPage;
