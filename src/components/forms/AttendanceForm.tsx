"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import {
  attendanceSchema,
  AttendanceSchema,
} from "@/lib/formValidationSchemas";
import { createAttendance, updateAttendance } from "@/lib/actions";
import InputField from "../InputField";

const AttendanceForm = ({
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
    setValue,
    formState: { errors },
  } = useForm<AttendanceSchema>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      ...data,
      present: false,
    },
  });

  const [selectedClassId, setSelectedClassId] = useState<number | null>(
    data?.classId ?? null
  );

  const router = useRouter();

  const onSubmit = handleSubmit(async (formData) => {
    formData.present = false;
    const action = type === "create" ? createAttendance : updateAttendance;
    const response = await action({ success: false, error: false }, formData);

    if (response.success) {
      toast(
        `Attendance ${type === "create" ? "created" : "updated"} successfully!`
      );
      setOpen(false);
      router.refresh();
    }
  });

  const { students, classes } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new attendance" : "Update attendance"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Date"
          name="date"
          type="datetime-local"
          register={register}
          error={errors?.date}
          defaultValue={data?.date}
        />

        <InputField
          label="Capacity"
          name="capacity"
          type="number"
          register={register}
          error={errors?.capacity}
          defaultValue={data?.capacity ?? ""}
        />

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Absent</label>
          <input
            type="text"
            value="Yes"
            readOnly
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class</label>
          <select
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setSelectedClassId(value);
              setValue("classId", value);
            }}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            defaultValue={data?.classId}
          >
            <option disabled selected={!selectedClassId}>
              Select a class
            </option>
            {classes.map((cls: { id: number; name: string }) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-400">
              {errors.classId.message.toString()}
            </p>
          )}
        </div>

        {/* <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Students</label>
          <select
            multiple
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
              setValue("studentIds", selected);
            }}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full h-32"
            defaultValue={data?.studentIds ?? []}
          >
            {students
              .filter((s: any) => s.classId === selectedClassId)
              .map((student: any) => (
                <option key={student.id} value={student.id}>
                  {student.name} {student.surname}
                </option>
              ))}
          </select>
          {errors.studentIds?.message && (
            <p className="text-xs text-red-400">{errors.studentIds.message.toString()}</p>
          )}
        </div> */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Students</label>
          <select
            multiple
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions).map(
                (opt) => opt.value
              );
              setValue("studentIds", selected);
            }}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full h-32"
            defaultValue={data?.studentIds ?? []}
          >
            {students
              .filter((s: any) => s.classId === selectedClassId)
              .map((student: any) => (
                <option key={student.id} value={student.id}>
                  {student.name} {student.surname}
                </option>
              ))}
          </select>
          {errors.studentIds?.message && (
            <p className="text-xs text-red-400">
              {errors.studentIds.message.toString()}
            </p>
          )}
        </div>
        {data?.id && (
          <InputField
            label="Id"
            name="id"
            register={register}
            error={errors?.id}
            defaultValue={data.id}
            hidden
          />
        )}

        <InputField
          label="Class ID"
          name="classId"
          register={register}
          hidden
        />
      </div>

      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default AttendanceForm;
