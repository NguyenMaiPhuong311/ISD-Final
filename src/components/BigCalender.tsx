"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendarFix.css"; // 👈 Thêm dòng này
import { useState } from "react";

const localizer = momentLocalizer(moment);

const getLatestMonday = (): Date => {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
};

const BigCalendar = ({ data }: { data: CalendarEvent[] }) => {
  const [view, setView] = useState<View>(Views.WORK_WEEK);

  return (
    <div className="h-full">
      <Calendar
        localizer={localizer}
        events={data}
        defaultView={Views.WORK_WEEK}
        view={view}
        onView={setView}
        views={["work_week", "day"]}
        defaultDate={getLatestMonday()}
        style={{ height: "100%" }}
        min={new Date(2025, 0, 1, 7, 0)}
        max={new Date(2025, 0, 1, 18, 0)}
        step={60}
        timeslots={1}
        components={{
          event: ({ event }) => {
            const [title, teacherLine, timeLine] = event.title.split("\n");
            return (
              <div className="text-xs text-gray-800 leading-tight px-1 whitespace-pre-line">
                <div className="font-semibold text-center">{title}</div>
                <div className="text-[10px] text-center text-gray-500">
                  {teacherLine}
                </div>
              </div>
            );
          },
        }}
        eventPropGetter={() => ({
          style: {
            whiteSpace: "pre-line",
            padding: "4px 6px",
            fontSize: "12px",
            overflow: "visible",
            backgroundColor: "#e0f2fe",
            border: "1px solid #90cdf4",
            borderRadius: "6px",
          },
        })}
      />
    </div>
  );
};

export default BigCalendar;
