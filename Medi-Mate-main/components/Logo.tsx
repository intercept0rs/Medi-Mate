import React from "react";

const logoSrc =
  "https://i.ibb.co/DPpx2BdL/d4400f64-a881-4925-b0d1-145284d93343-processed.png ";

interface LogoProps {
  className?: string;
  style?: React.CSSProperties;
}

const Logo: React.FC<LogoProps> = ({ className, style }) => (
  <img
    src={logoSrc}
    alt="MediMate Logo"
    className={`w-128 h-128 object-contain ${className || ""}`} // 👈 bigger size
    style={style}
  />
);

export default Logo;
