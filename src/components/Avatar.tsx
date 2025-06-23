/* components/Avatar.tsx ------------------------------------ */
"use client";
import Image from "next/image";
import { useState } from "react";

interface AvatarProps {
  src?: string; // 프로필 URL
  size?: number; // px
  alt?: string;
}

export default function Avatar({
  src,
  size = 34,
  alt = "avatar",
}: AvatarProps) {
  const [err, setErr] = useState(false);
  const fallback = "/caa/user.svg"; // 기본 아이콘

  return (
    <div
      className="rounded-full overflow-hidden bg-gray-100 flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <Image
        src={err || !src ? fallback : src}
        alt={alt}
        fill // 부모 div를 꽉 채움
        sizes={`${size}px`}
        className="object-cover" // 원본 비율 유지하며 크롭
        onError={() => setErr(true)}
        priority
      />
    </div>
  );
}
