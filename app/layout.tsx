import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/context/DataContext";
import { SimulatorProvider } from "@/context/SimulatorContext";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GreenStack — Carbon & Cost Command Center",
  description: "Visualize and reduce your cloud carbon footprint",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-slate-900 min-h-screen`}>
        <DataProvider>
          <SimulatorProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
            </div>
          </SimulatorProvider>
        </DataProvider>
      </body>
    </html>
  );
}
