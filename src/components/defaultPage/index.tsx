"use client";

import { Sidebar } from "../sidebar";

const DefaultPage = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <div className="flex">
        <Sidebar />
        <div className="flex flex-col w-full">{children}</div>
      </div>
    </div>
  );
};

export default DefaultPage;
