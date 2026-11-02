import "server-only";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function getViewerCourseAccess(courseId: string) {
  const session = await getSession();
  if (!session) {
    return { session: null, isEnrolled: false };
  }
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.sub, courseId } },
  });
  return { session, isEnrolled: Boolean(enrollment) };
}
