import React from 'react';
import IconRenderer from './IconRenderer'; // Import the central IconRenderer
// Home icon is now handled by IconRenderer, no need to import here directly unless used elsewhere

interface LogoProps {
  logoUrl?: string | null; // Can be null from config
  logoIconName?: string | null; // New prop for icon name
  altText?: string;
  className?: string; // For styling the container/icon/image
}

const Logo: React.FC<LogoProps> = ({
  logoUrl,
  logoIconName,
  altText = "Site Logo",
  className = "",
}) => {

  // Base classes + custom classes passed via props
  const baseClasses = `block mx-auto w-auto mb-6`;
  const combinedIconClassName = `${baseClasses} ${className}`.trim();
  const combinedImageClassName = `${baseClasses} ${className}`.trim();

  // Render Priority: Icon Name > URL > Default Home Icon
  if (logoIconName) {
    // Use the central IconRenderer
    return (
      <IconRenderer
        iconName={logoIconName}
        className={combinedIconClassName}
        aria-label={altText}
      />
    );
  } else if (logoUrl) {
    // Render image from URL if icon name isn't specified
    return (
      <img
        src={logoUrl}
        alt={altText}
        className={combinedImageClassName}
        onError={(e) => {
          console.warn(`Failed to load logo from URL: ${logoUrl}.`);
          (e.target as HTMLImageElement).style.display = 'none'; // Hide broken image
        }}
      />
    );
  } else {
    // Render default Home icon using IconRenderer
    return (
       <IconRenderer iconName="Home" className={combinedIconClassName} aria-label={altText} />
    );
  }
};

export default Logo;
