import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_user/profile")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/admin" });
  },
});
