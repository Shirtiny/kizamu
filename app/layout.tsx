import dynamic from "next/dynamic";
import "nprogress/nprogress.css";

const AppLayout = dynamic(() => import("../layouts/App"), { ssr: false });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
