"use client"
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Link href="/sign-in">
        <Button>Signin</Button>
      </Link>
      <Button onClick={() => signIn("github")}> nihao</Button>

    </div>
  );
}
