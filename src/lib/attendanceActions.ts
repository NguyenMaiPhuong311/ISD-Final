// src/lib/attendanceActions.ts
"use server";

import prisma from "@/lib/prisma";

export type AttendanceDeleteState = {
  success: boolean;
  error?: boolean;
};

export async function deleteAttendanceBulkAction(
  _: AttendanceDeleteState,
  formData: FormData
): Promise<AttendanceDeleteState> {
  const classId = Number(formData.get("classId"));
  const date = formData.get("date")?.toString();
  const present = formData.get("present") === "true";
  const capacity = Number(formData.get("capacity")); // ✅ nếu bạn dùng để phân biệt nhóm

  if (!classId || !date) {
    console.error("❌ Missing classId or date");
    return { success: false, error: true };
  }

  try {
    await prisma.attendance.deleteMany({
      where: {
        classId,
        date: new Date(date),
        present,
        capacity,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Delete attendance failed:", error);
    return { success: false, error: true };
  }
}
