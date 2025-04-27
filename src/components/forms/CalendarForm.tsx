"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import InputField from "../InputField";
import { calendarSchema, CalendarSchema } from "@/lib/formValidationSchemas";
import { createCalendar, updateCalendar } from "@/lib/actions";

const CalendarForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CalendarSchema>({
    resolver: zodResolver(calendarSchema),
    defaultValues: {
      ...data,
      startTime: data?.startTime ?? "",
      endTime: data?.endTime ?? "",
      dayOfWeek: data?.dayOfWeek ?? "",
      subjectIds:
        data?.subjects?.map((subject: { id: number }) => subject.id) ?? [],
      repeatWeeks: data?.repeatWeeks ?? 1,
    },
  });

  const router = useRouter();

  const onSubmit = handleSubmit(async (formData) => {
    // Không cần chuyển đổi sang ISO nữa
    const action = type === "create" ? createCalendar : updateCalendar;
    const response = await action({ success: false, error: false }, formData);

    if (response.success) {
      toast(
        `Calendar ${type === "create" ? "created" : "updated"} successfully!`
      );
      setOpen(false);
      router.refresh();
    }
  });

  const { teachers, classes, subjects } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create"
          ? "Create a new Calendar Event"
          : "Update the Calendar Event"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        {/* Start Time */}
        <InputField
          label="Start Time"
          name="startTime"
          type="time"
          register={register}
          error={errors?.startTime}
        />

        {/* End Time */}
        <InputField
          label="End Time"
          name="endTime"
          type="time"
          register={register}
          error={errors?.endTime}
        />

        {/* Day of the Week */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Day of the Week</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("dayOfWeek")}
            defaultValue={data?.dayOfWeek}
          >
            <option value="">Select Day</option>
            {[
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ].map((day) => (
              <option value={day} key={day}>
                {day}
              </option>
            ))}
          </select>
          {errors.dayOfWeek?.message && (
            <p className="text-xs text-red-400">
              {errors.dayOfWeek.message.toString()}
            </p>
          )}
        </div>

        {/* Teacher */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Teacher</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("teacherId")}
            defaultValue={data?.teacherId}
          >
            {teachers.map((teacher: { id: string; name: string }) => (
              <option value={teacher.id} key={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>
          {errors.teacherId?.message && (
            <p className="text-xs text-red-400">
              {errors.teacherId.message.toString()}
            </p>
          )}
        </div>

        {/* Class */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId")}
            defaultValue={data?.classId}
          >
            {classes.map((classItem: { id: number; name: string }) => (
              <option value={classItem.id} key={classItem.id}>
                {classItem.name}
              </option>
            ))}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-400">
              {errors.classId.message.toString()}
            </p>
          )}
        </div>

        {/* Subjects */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Subjects</label>
          <select
            multiple
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("subjectIds")}
            defaultValue={data?.subjects?.map(
              (subject: { id: number }) => subject.id
            )}
          >
            {subjects.map((subject: { id: number; name: string }) => (
              <option value={subject.id} key={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subjectIds?.message && (
            <p className="text-xs text-red-400">
              {errors.subjectIds.message.toString()}
            </p>
          )}
        </div>

      </div>

      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default CalendarForm;
