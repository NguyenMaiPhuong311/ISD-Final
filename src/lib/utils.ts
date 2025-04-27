const dayOfWeekMap: Record<string, number> = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};

const getLatestMonday = (): Date => {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Lùi về thứ Hai
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

export const adjustScheduleToCurrentWeek = (
  lessons: {
    title: string;
    startTime: string; // "HH:mm"
    endTime: string;
    dayOfWeek: string; // "Monday", etc.
  }[]
): {
  title: string;
  start: Date;
  end: Date;
}[] => {
  const baseMonday = getLatestMonday();

  return lessons.map((lesson) => {
    const offset = dayOfWeekMap[lesson.dayOfWeek];

    const [sh, sm] = lesson.startTime.split(":").map(Number);
    const [eh, em] = lesson.endTime.split(":").map(Number);

    const start = new Date(baseMonday);
    start.setDate(baseMonday.getDate() + offset);
    start.setHours(sh, sm, 0, 0);

    const end = new Date(baseMonday);
    end.setDate(baseMonday.getDate() + offset);
    end.setHours(eh, em, 0, 0);

    // Nếu không có duration → thêm 5 phút
    if (start.getTime() === end.getTime()) {
      end.setMinutes(end.getMinutes() + 5);
    }

    return {
      title: lesson.title,
      start,
      end,
    };
  });
};
