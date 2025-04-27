"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";

import InputField from "../InputField";
import { lessonSchema, LessonSchema } from "@/lib/formValidationSchemas";
import { createLesson, updateLesson } from "@/lib/actions";


const LessonForm = ({
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
  } = useForm<LessonSchema>({
    resolver: zodResolver(lessonSchema),
    defaultValues: data || {},
  });

  const [uploadedFile, setUploadedFile] = useState<string | null>(
    data?.fileUrl || null
  );
  const [fileError, setFileError] = useState<string | null>(null); // State to store file upload error message
  const router = useRouter();

  const onSubmit = handleSubmit(async (formData) => {
    if (!uploadedFile) {
      setFileError("Please upload a file before submitting!"); // Show error if no file is uploaded
      return;
    }

    formData.fileUrl = uploadedFile ?? undefined;

    const action = type === "create" ? createLesson : updateLesson;
    const response = await action({ success: false, error: false }, formData);

    if (response.success) {
      toast(
        `Lesson ${type === "create" ? "created" : "updated"} successfully!`
      );
      setOpen(false);
      router.refresh();
    }
  });

  const { classes, teachers, subjects } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new lesson" : "Update the lesson"}
      </h1>

      {/* Basic Information */}
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Lesson Name"
          name="name"
          register={register}
          error={errors?.name}
        />
        <InputField
          label="Title"
          name="title"
          register={register}
          error={errors?.title}
        />
        <InputField
          label="Description"
          name="description"
          register={register}
        />
        <InputField label="Note" name="content" register={register} />
      </div>

      {/* Schedule */}
      <div className="flex justify-between flex-wrap gap-4">
        {/* Day Selection */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Day</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("day")}
          >
            {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"].map(
              (day) => (
                <option value={day} key={day}>
                  {day}
                </option>
              )
            )}
          </select>
          {errors.day?.message && (
            <p className="text-xs text-red-400">
              {errors.day.message.toString()}
            </p>
          )}
        </div>

        {/* Start Time */}
        <InputField
          label="Start Time"
          name="startTime"
          type="datetime-local"
          register={register}
          error={errors?.startTime}
        />

        {/* End Time */}
        <InputField
          label="End Time"
          name="endTime"
          type="datetime-local"
          register={register}
          error={errors?.endTime}
        />
      </div>

      {/* Class Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Class</label>
          <select
            className="ring-1 ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId")}
          >
            {classes.length > 0 ? (
              classes.map(
                (classItem: {
                  id: number;
                  name: string;
                  capacity: number;
                  _count: { students: number };
                }) => (
                  <option value={classItem.id} key={classItem.id}>
                    {classItem.name} - {classItem._count.students}/
                    {classItem.capacity} Capacity
                  </option>
                )
              )
            ) : (
              <option value="" disabled>
                No classes available
              </option>
            )}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-400">
              {errors.classId.message.toString()}
            </p>
          )}
        </div>

        {/* Subject Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Subjects</label>
          <select
            className="ring-1 ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("subjectId")}
          >
            {subjects.length > 0 ? (
              subjects.map((subject: { id: number; name: string }) => (
                <option value={subject.id} key={subject.id}>
                  {subject.name}
                </option>
              ))
            ) : (
              <option value="" disabled>
                No subjects available
              </option>
            )}
          </select>
          {errors.subjectId?.message && (
            <p className="text-xs text-red-400">
              {errors.subjectId.message.toString()}
            </p>
          )}
        </div>

        {/* Teacher Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Teacher</label>
          <select
            className="ring-1 ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("teacherId")}
          >
            {teachers.length > 0 ? (
              teachers.map(
                (teacher: { id: string; name: string; surname: string }) => (
                  <option value={teacher.id} key={teacher.id}>
                    {teacher.name} {teacher.surname}
                  </option>
                )
              )
            ) : (
              <option value="" disabled>
                No teachers available
              </option>
            )}
          </select>
          {errors.teacherId?.message && (
            <p className="text-xs text-red-400">
              {errors.teacherId.message.toString()}
            </p>
          )}
        </div>
      </div>

      {/* Upload File */}
      <div className="flex flex-col gap-2 w-full">
        <label className="text-xs text-gray-500">Upload File</label>
        <CldUploadWidget
          uploadPreset="school"
          onSuccess={(result, { widget }) => {
            if (result.event === "success" && typeof result.info === "object") {
              const fileUrl = (result.info as { secure_url: string })
                .secure_url;
              setUploadedFile(fileUrl);
              setValue("fileUrl", fileUrl);
            }
            widget.close();
          }}
        >
          {({ open }) => (
            <div
              className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
              onClick={() => open()}
            >
              <Image
                src="/upload.png"
                alt="Upload Icon"
                width={28}
                height={28}
              />
              <span>Upload a file</span>
            </div>
          )}
        </CldUploadWidget>
        {uploadedFile && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">Uploaded file:</p>
            <a
              href={uploadedFile}
              target="_blank"
              className="text-blue-500 underline"
            >
              {uploadedFile}
            </a>
          </div>
        )}

        {/* Display error if no file is uploaded */}
        {errors.fileUrl?.message && (
          <p className="text-xs text-red-400">
            {errors.fileUrl.message.toString()}
          </p>
        )}
      </div>

      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default LessonForm;
