import { currentUser } from "@clerk/nextjs/server";
import MenuClient from "./MenuClient"; // 👈 client component

const Menu = async () => {
  const user = await currentUser();
  const role = user?.publicMetadata.role as string;

  return <MenuClient role={role} />;
};

export default Menu;