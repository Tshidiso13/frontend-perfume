"use client";

import { FcGoogle } from "react-icons/fc";

import { API_URL } from "@/lib/api";

export function GoogleAuthButton({
  label = "Continue with Google",
}: {
  label?: string;
}) {
  function handleGoogleLogin() {
    window.location.href = `${API_URL}/auth/google`;
  }

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="
        flex
        min-h-[52px]
        w-full
        items-center
        justify-center
        gap-3
        border
        border-[#d9d0ca]
        bg-[#fbfaf7]
        px-5
        text-[9px]
        font-medium
        !text-[#493732]

        transition-colors

        hover:bg-[#f3eee9]
      "
    >
      <FcGoogle className="size-4" />

      {label}
    </button>
  );
}