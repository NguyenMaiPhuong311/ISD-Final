import Performance from "./Performance";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const PerformanceWrapper = async ({ studentId }: { studentId: string }) => {
    const results = await prisma.result.findMany({
      where: { studentId },
      select: { score: true },
    });
  
    return <Performance results={results} />;
  };
  
  export default PerformanceWrapper;
  