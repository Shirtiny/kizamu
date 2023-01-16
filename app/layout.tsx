import dynamic from "next/dynamic";
import AppLayout from "../layouts/App";
import "nprogress/nprogress.css";

// const AppLayout = dynamic(() => import(), { ssr: false });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no"
        />
      </head>
      <body className="root-app-layout __plain_text_READY__">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
