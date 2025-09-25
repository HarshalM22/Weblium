// components/BackgroundWrapper.tsx
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const BackgroundWrapper = ({ children }: Props) => (
  <div className="min-h-screen w-full bg-white relative">
    {/* Layer 1: The main color gradient (bottom layer) */}
    <div
      className="absolute inset-0 z-0"
      style={{
        backgroundImage: `radial-gradient(125% 125% at 50% 90%, #080708 40%, #f1f0ea 100%)`,
      }}
    />
    
    {/* Layer 2: The dotted pattern with a sharp, synchronized mask */}
    <div
      className="absolute inset-0 z-0"
      style={{
        // Using a subtle, semi-transparent white for the dots
        backgroundImage: `radial-gradient(hsl(0 0 100% / 0.1) 1px, transparent 1px)`,
        backgroundSize: '16px 16px',
        // This mask has a SHARP cutoff at 40% to match the black color
        maskImage: `radial-gradient(125% 125% at 50% 90%, white 40%, transparent 40.1%)`,
        // The Webkit version is now IDENTICAL for perfect browser consistency
        WebkitMaskImage: `radial-gradient(125% 125% at 50% 90%, white 40%, transparent 40.1%)`,
      }}
    />
    
    {/* The content, which sits on top of all background layers */}
    <div className="relative z-10">{children}</div>
  </div>
);

export default BackgroundWrapper;
