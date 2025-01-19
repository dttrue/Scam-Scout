import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  organizationSyncOptions: {
    organizationPatterns: ["/orgs/:slug", "/orgs/:slug/(.*)"],
    personalAccountPatterns: ["/dashboard", "/dashboard/(.*)"],
  },
  debug: true, // Enable debugging
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*|api/webhooks).*)", // Exclude /api/webhooks
    "/(api|trpc)(.*)",
  ],
};
