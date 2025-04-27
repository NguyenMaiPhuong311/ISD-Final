// import { UserButton } from "@clerk/nextjs";
// import { currentUser } from "@clerk/nextjs/server";
// import Image from "next/image";

// const Navbar = async () => {
//   const user = await currentUser();
//   return (
//     <div className="flex items-center justify-between p-4">
//       {/* SEARCH BAR */}
//       <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
//         <Image src="/search.png" alt="" width={14} height={14} />
//         <input
//           type="text"
//           placeholder="Search..."
//           className="w-[200px] p-2 bg-transparent outline-none"
//         />
//       </div>
//       {/* ICONS AND USER */}
//       <div className="flex items-center gap-6 justify-end w-full">
//         <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">
//           <Image src="/message.png" alt="" width={20} height={20} />
//         </div>
//         <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
//           <Image src="/announcement.png" alt="" width={20} height={20} />
//           <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
//             1
//           </div>
//         </div>
//         <div className="flex flex-col">
//           <span className="text-xs leading-3 font-medium">John</span>
//           <span className="text-[10px] text-gray-500 text-right">
//             {user?.publicMetadata?.role as string}
//           </span>
//         </div>
//         {/* <Image src="/avatar.png" alt="" width={36} height={36} className="rounded-full"/> */}
//         <UserButton />
//       </div>
//     </div>
//   );
// };

// export default Navbar;

import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import prisma from "@/lib/prisma";

const getUserNameByRole = async (id: string, role: string) => {
  switch (role) {
    case "teacher": {
      const teacher = await prisma.teacher.findUnique({ where: { id } });
      return teacher?.name || "Unknown Teacher";
    }
    case "student": {
      const student = await prisma.student.findUnique({ where: { id } });
      return student?.name || "Unknown Student";
    }
    case "parent": {
      const parent = await prisma.parent.findUnique({ where: { id } });
      return parent?.name || "Unknown Parent";
    }
    default:
      return "User";
  }
};

const Navbar = async () => {
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string;
  const name = user?.id ? await getUserNameByRole(user.id, role) : "User";

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

      {/* ICONS AND USER */}
      <div className="flex items-center gap-6 justify-end w-full">
        <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">
          <Image src="/message.png" alt="" width={20} height={20} />
        </div>
        <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
          <Image src="/announcement.png" alt="" width={20} height={20} />
          <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
            1
          </div>
        </div>

        {/* USER INFO */}
        <div className="flex flex-col">
          <span className="text-xs leading-3 font-medium">{name}</span>
          <span className="text-[10px] text-gray-500 text-right">{role}</span>
        </div>

        <UserButton />
      </div>
    </div>
  );
};

export default Navbar;