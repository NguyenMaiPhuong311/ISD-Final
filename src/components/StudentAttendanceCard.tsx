
import prisma from "@/lib/prisma";

const StudentAttendanceCard = async ({ id }: { id: string }) => {
  const attendance = await prisma.attendance.findMany({
    where: {
      studentId: id,
      date: {
        gte: new Date(new Date().getFullYear(), 0, 1), // từ đầu năm
      },
    },
  });

  const totalDays = attendance.length;
  const absentDays = attendance.filter((day) => day.present === false).length;
  const presentDays = totalDays - absentDays;
  const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

  return (
    <div className="flex flex-col gap-1">
      {/* <h1 className="text-xl font-semibold">{percentage.toFixed(1)}%</h1> */}
      <h1 className="text-xl font-semibold"> Absent: {absentDays} day</h1>
      {/* <span className="text-sm text-gray-400">
        Present: {presentDays} / {totalDays}
      </span>
      <span className="text-sm text-red-500">
        Absent: {absentDays} buổi
      </span> */}
    </div>
  );
};

export default StudentAttendanceCard;
