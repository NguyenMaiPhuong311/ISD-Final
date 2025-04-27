// import Image from "next/image";
// import AttendanceChart from "./AttendanceChart";
// import prisma from "@/lib/prisma";

// const AttendanceChartContainer = async () => {
//   const today = new Date();
//   const dayOfWeek = today.getDay();
//   const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
//   const lastMonday = new Date(today);
//   lastMonday.setDate(today.getDate() - daysSinceMonday);

//   // Lấy tất cả học sinh
//   const totalStudents = await prisma.student.count();

//   // Lấy toàn bộ dữ liệu điểm danh từ thứ 2 tuần này đến hôm nay
//   const resData = await prisma.attendance.findMany({
//     where: {
//       date: {
//         gte: lastMonday,
//       },
//     },
//     select: {
//       date: true,
//       present: true,
//     },
//   });

//   const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"];
//   const attendanceMap: { [key: string]: { absent: number } } = {
//     Mon: { absent: 0 },
//     Tue: { absent: 0 },
//     Wed: { absent: 0 },
//     Thu: { absent: 0 },
//     Fri: { absent: 0 },
//   };

//   resData.forEach((item) => {
//     const itemDate = new Date(item.date);
//     const day = itemDate.getDay(); // 1: Mon, ..., 5: Fri
//     if (day >= 1 && day <= 5) {
//       const dayName = daysOfWeek[day - 1];
//       if (!item.present) {
//         attendanceMap[dayName].absent += 1;
//       }
//     }
//   });

//   const chartData = daysOfWeek.map((day) => {
//     const absent = attendanceMap[day].absent;
//     const present = totalStudents - absent;
//     return {
//       name: day,
//       absent,
//       present,
//     };
//   });

//   return (
//     <div className="bg-white rounded-lg p-4 h-full">
//       <div className="flex justify-between items-center">
//         <h1 className="text-lg font-semibold">Attendance</h1>
//         <Image src="/moreDark.png" alt="" width={20} height={20} />
//       </div>
//       <AttendanceChart data={chartData} />
//     </div>
//   );
// };

// export default AttendanceChartContainer;

import Image from "next/image";
import AttendanceChart from "./AttendanceChart";
import prisma from "@/lib/prisma";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
type Day = (typeof daysOfWeek)[number];

const AttendanceChartContainer = async () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sun) -> 6 (Sat)
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() - daysSinceMonday);

  // Lấy tổng số học sinh
  const totalStudents = await prisma.student.count();

  // Lấy dữ liệu điểm danh từ thứ 2 đến hiện tại
  const resData = await prisma.attendance.findMany({
    where: {
      date: {
        gte: lastMonday,
      },
    },
    select: {
      date: true,
      present: true,
    },
  });

  // Tạo map dữ liệu theo ngày
  const attendanceMap: { [key in Day]: { absent: number } } = {
    Mon: { absent: 0 },
    Tue: { absent: 0 },
    Wed: { absent: 0 },
    Thu: { absent: 0 },
    Fri: { absent: 0 },
    Sat: { absent: 0 },
  };

  resData.forEach((item) => {
    const itemDate = new Date(item.date);
    const day = itemDate.getDay(); // Mon = 1, ..., Sat = 6
    if (day >= 1 && day <= 6) {
      const dayName = daysOfWeek[day - 1]; // -1 vì array bắt đầu từ 0
      if (!item.present) {
        attendanceMap[dayName].absent += 1;
      }
    }
  });

  const chartData = daysOfWeek.map((day) => {
    const absent = attendanceMap[day].absent;
    const present = totalStudents - absent;
    return {
      name: day,
      absent,
      present,
    };
  });

  return (
    <div className="bg-white rounded-lg p-4 h-full">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-lg font-semibold">Attendance</h1>
        <Image src="/moreDark.png" alt="filter" width={20} height={20} />
      </div>
      <AttendanceChart data={chartData} />
    </div>
  );
};

export default AttendanceChartContainer;

