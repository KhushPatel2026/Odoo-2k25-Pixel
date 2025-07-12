"use client";

import React from "react";

export default function GlobeHero() {
  return (
    <div className="relative w-full flex h-40 md:h-64 overflow-hidden">
      <img
        src="https://blocks.mvp-subha.me/assets/earth.png"
        alt="Global Knowledge Network"
        className="absolute px-4 top-0 left-1/2 -translate-x-1/2 mx-auto -z-10 opacity-80"
      />
    </div>
  );
}
