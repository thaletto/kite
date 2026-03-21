import { SignUpForm } from "@/components/auth/signup-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <Image
            src="/ADC.svg"
            alt="A Developer Company"
            width={48}
            height={48}
            className="rounded"
          />
          A Developer Company
        </a>
        <SignUpForm />
      </div>
    </div>
  );
}
