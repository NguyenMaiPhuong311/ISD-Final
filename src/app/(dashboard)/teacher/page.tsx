import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import { auth } from "@clerk/nextjs/server";
import EventCalendar from "@/components/EventCalendar";
import Link from "next/link";

const TeacherPage = () => {
  const { userId } = auth();

  if (!userId) {
    return (
      <div className="flex-1 p-6 m-4 bg-gradient-to-br from-white via-blue-50 to-purple-100 rounded-xl shadow-md font-sans">
        <h1 className="text-xl font-bold text-red-500">⚠️ Please log in to view your schedule.</h1>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 m-4 mt-0 bg-gradient-to-br from-white via-blue-50 to-purple-100 rounded-xl shadow-md font-sans flex flex-col xl:flex-row gap-6">
      {/* LEFT */}
      <div className="w-full xl:w-2/3 flex flex-col gap-6">
        {/* Big Calendar */}
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
              📅 Your Teaching Calendar
            </h2>
          </div>
          <BigCalendarContainer type="teacherId" id={userId} />
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-6">
        {/* Announcements Block */}
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300">
          {/* Không thêm header ở ngoài! Chỉ để component tự render header bên trong */}
          <Announcements />
        </div>

        {/* Calendar (Event Calendar) Block */}
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-blue-700 flex items-center gap-2">
              📅 Calendar
            </h2>
          </div>
          <EventCalendar />
        </div>
      </div>
    </div>
  );
};

export default TeacherPage;
