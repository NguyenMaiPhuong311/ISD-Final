import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import prisma from "@/lib/prisma";

const getUserInfoByRole = async (id: string, role: string) => {
  switch (role) {
    case "teacher": {
      const teacher = await prisma.teacher.findUnique({ where: { id } });
      return {
        name: teacher?.name || "Unknown Teacher",
        img: teacher?.img || null,
      };
    }
    case "student": {
      const student = await prisma.student.findUnique({ where: { id } });
      return {
        name: student?.name || "Unknown Student",
        img: student?.img || null,
      };
    }
    default:
      return { name: "User", img: null };
  }
};

const Navbar = async () => {
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string;
  const { name, img } = user?.id
    ? await getUserInfoByRole(user.id, role)
    : { name: "User", img: null };

  return (
    <div className="flex items-center justify-between p-4">
      {/* SEARCH BAR */}
      <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
        <Image src="/search.png" alt="" width={14} height={14} />
        <input
          type="text"
          placeholder="Search..."
          className="w-[200px] p-2 bg-transparent outline-none"
        />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-6 justify-end w-full">
        <div className="flex flex-col text-right">
          <span className="text-sm font-medium">{name}</span>
          <span className="text-xs text-gray-500">{role}</span>
        </div>

        {/* WRAP user button in a relative div to overlay custom avatar */}
        <div className="relative w-9 h-9">
          {/* Hidden UserButton avatar */}
          <div className="absolute inset-0 z-10">
            <UserButton afterSignOutUrl="/" />
          </div>

          {/* Custom avatar overlay (click-through) */}
          {img && (
            <Image
              src={img}
              alt="avatar"
              fill
              className="rounded-full object-cover cursor-pointer z-20 pointer-events-none"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
