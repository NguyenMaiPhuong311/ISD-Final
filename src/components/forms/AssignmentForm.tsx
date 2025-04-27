"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useEffect } from "react";
import InputField from "../InputField";
import {
  assignmentSchema,
  AssignmentSchema,
} from "@/lib/formValidationSchemas";
import { createAssignment, updateAssignment } from "@/lib/actions";

const AssignmentForm = ({
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
  } = useForm<AssignmentSchema>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: data || {},
  });

  useEffect(() => {
    if (data?.fileUrl) {
      setUploadedFile(data.fileUrl);
      setValue("fileUrl", data.fileUrl);
    }
  }, [data, setValue]);

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

    const action = type === "create" ? createAssignment : updateAssignment;
    const response = await action({ success: false, error: false }, formData);

    if (response.success) {
      toast(
        `Assignment ${type === "create" ? "created" : "updated"} successfully!`
      );
      setOpen(false);
      router.refresh();
    }
  });

  const { lessons } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create"
          ? "Create a new assignment"
          : "Update the assignment"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Assignment Title"
          name="title"
          register={register}
          error={errors?.title}
          defaultValue={data?.title}
        />
        <InputField
          label="Start Date"
          name="startDate"
          type="datetime-local"
          register={register}
          error={errors?.startDate}
          defaultValue={data?.startDate}
        />
        <InputField
          label="Due Date"
          name="dueDate"
          type="datetime-local"
          register={register}
          error={errors?.dueDate}
          defaultValue={data?.dueDate}
        />
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

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Lesson</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("lessonId")}
            defaultValue={data?.lessonId}
          >
            {lessons.map((lesson: { id: number; name: string }) => (
              <option value={lesson.id} key={lesson.id}>
                {lesson.name}
              </option>
            ))}
          </select>
          {errors.lessonId?.message && (
            <p className="text-xs text-red-400">
              {errors.lessonId.message.toString()}
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

export default AssignmentForm;
