import prisma from "@/lib/prisma";
import BigCalendar from "./BigCalender";
import { adjustScheduleToCurrentWeek } from "@/lib/utils";

const BigCalendarContainer = async ({
  type,
  id,
}: {
  type: "teacherId" | "classId";
  id: string | number;
}) => {
  const calendars = await prisma.calendar.findMany({
    where:
      type === "teacherId"
        ? { teacherId: id as string }
        : { classId: id as number },
    include: {
      subjects: true,
      class: true,
      teacher: true,
    },
  });

  const extractTime = (dateInput: string | Date): string => {
    if (typeof dateInput === "string" && /^\d{2}:\d{2}$/.test(dateInput)) {
      return dateInput;
    }
    const date =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return "00:00";
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const rawData = calendars.map((calendar) => {
    const subjectAndClass = `${calendar.subjects
      .map((s) => s.name)
      .join(", ")} – Class ${calendar.class?.name ?? ""}`;
    const tooltipDetails = `GV: ${calendar.teacher.name} ${
      calendar.teacher.surname
    } – ${extractTime(calendar.startTime)}–${extractTime(calendar.endTime)}`;

    return {
      title: `${subjectAndClass}\n${tooltipDetails}`,
      startTime: extractTime(calendar.startTime),
      endTime: extractTime(calendar.endTime),
      dayOfWeek: calendar.dayOfWeek,
    };
  });

  const schedule = adjustScheduleToCurrentWeek(rawData);

  return (
    <div className="h-[600px]">
      <BigCalendar data={schedule} />
    </div>
  );
};

export default BigCalendarContainer;
