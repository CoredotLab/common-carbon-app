"use client";

import AOS from "aos";
import "aos/dist/aos.css";
import React, { useEffect } from "react";

export default function AOSProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    AOS.init({
      once: true,
      duration: 1500,
      delay: 150,
    });
  }, []);

  return <>{children}</>;
}
