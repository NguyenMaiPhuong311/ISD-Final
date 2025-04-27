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
import {
  submissionSchema,
  SubmissionSchema,
} from "@/lib/formValidationSchemas";
import { createSubmission, updateSubmission } from "@/lib/actions";

const SubmissionForm = ({
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
  } = useForm<SubmissionSchema>({
    resolver: zodResolver(submissionSchema),
    defaultValues: data || {},
  });

  const [uploadedFile, setUploadedFile] = useState<string | null>(
    data?.fileUrl || null
  );
  const [fileError, setFileError] = useState<string | null>(null); // State to store file upload error message
  const router = useRouter();

  useEffect(() => {
    if (data?.fileUrl) {
      setUploadedFile(data.fileUrl);
      setValue("fileUrl", data.fileUrl);
    }
  }, [data, setValue]);

  const onSubmit = handleSubmit(async (formData) => {
    // Check if file is uploaded
    if (!uploadedFile) {
      setFileError("Please upload a file before submitting!"); // Show error if no file is uploaded
      return;
    }

    formData.fileUrl = uploadedFile ?? undefined;

    const action = type === "create" ? createSubmission : updateSubmission;
    const response = await action({ success: false, error: false }, formData);

    if (response.success) {
      toast(
        `Submission ${
          type === "create" ? "submitted" : "updated"
        } successfully!`
      );
      setOpen(false);
      router.refresh();
    } else {
      toast.error("An error occurred while submitting the form!");
    }
  });

  const { assignments, students } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create"
          ? "Submit a new Assignment"
          : "Update the Submission"}
      </h1>

      {/* Assignment and Student Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Assignment Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Assignment</label>
          <select
            className="ring-1 ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("assignmentId")}
          >
            {assignments.length > 0 ? (
              assignments.map((assignment: { id: number; title: string }) => (
                <option value={assignment.id} key={assignment.id}>
                  {assignment.title}
                </option>
              ))
            ) : (
              <option value="" disabled>
                No assignments available
              </option>
            )}
          </select>
          {errors.assignmentId?.message && (
            <p className="text-xs text-red-400">
              {errors.assignmentId.message.toString()}
            </p>
          )}
        </div>

        {/* Student Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Student</label>
          <select
            className="ring-1 ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("studentId")}
          >
            {students.length > 0 ? (
              students.map(
                (student: { id: string; name: string; surname: string }) => (
                  <option value={student.id} key={student.id}>
                    {student.name} {student.surname}
                  </option>
                )
              )
            ) : (
              <option value="" disabled>
                No students available
              </option>
            )}
          </select>
          {errors.studentId?.message && (
            <p className="text-xs text-red-400">
              {errors.studentId.message.toString()}
            </p>
          )}
        </div>
      </div>

      {/* Note and File Upload */}
      <div className="flex flex-col gap-4">
        {/* Note */}
        <InputField
          label="Note"
          name="note"
          register={register}
          error={errors?.note}
        />

        {/* Upload File */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Upload File</label>
          <CldUploadWidget
            uploadPreset="school"
            onSuccess={(result, { widget }) => {
              if (
                result.event === "success" &&
                typeof result.info === "object"
              ) {
                const fileUrl = (result.info as { secure_url: string })
                  .secure_url;
                setUploadedFile(fileUrl);
                setValue("fileUrl", fileUrl);
                setFileError(null); // Clear error if file is uploaded successfully
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
        </div>

        {/* Display error if no file is uploaded */}
        {errors.fileUrl?.message && (
          <p className="text-xs text-red-400">
            {errors.fileUrl.message.toString()}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Submit Assignment" : "Update Submission"}
      </button>
    </form>
  );
};

export default SubmissionForm;
