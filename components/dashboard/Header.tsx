"use client";

import React from "react";

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="sticky top-0 bg-white shadow-lg rounded-lg p-6 mb-6">
      <h1 className="text-4xl font-extrabold text-purple-700 text-center">
        {title}
      </h1>
    </header>
  );
};

export default Header;
