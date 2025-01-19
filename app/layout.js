import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import NavbarWithDrawer from "@/components/navigation/NavbarWithDrawer";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          card: "rounded-lg shadow-lg",
        },
      }}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard" // Redirect after sign-in
      afterSignUpUrl="/dashboard" // Redirect after sign-up
    >
      <html lang="en">
        <body>
          <NavbarWithDrawer />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
