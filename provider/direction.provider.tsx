"use client";
import React from "react";

const DirectionProvider = ({ children }: { children: React.ReactNode }) => {
 return (
 <div dir="ltr">
 {children}
 </div>
 );
};

export default DirectionProvider;
