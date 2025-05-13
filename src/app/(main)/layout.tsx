import { getUserSubscriptionLevel } from "@/lib/subscription";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import SubscriptionLevelProvider from "./SubscriptionLevelProvider";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  const userSubscriptionLevel = await getUserSubscriptionLevel();

  return (
    <SubscriptionLevelProvider userSubscriptionLevel={userSubscriptionLevel}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        {children}
      </div>
    </SubscriptionLevelProvider>
  );
}
