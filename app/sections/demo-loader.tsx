"use client";

import dynamic from "next/dynamic";

const Demo = dynamic(() => import("@/app/sections/demo").then((m) => m.Demo), { ssr: false });

export { Demo };
