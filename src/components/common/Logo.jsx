import React from "react";

const Logo = ({ collapsed = false }) => {
  if (!collapsed) {
    return (
      <div className="flex items-center">
        <svg
          width="120"
          height="30"
          viewBox="0 0 120 40"
          className="text-blue-500"
        >
          <path
            d="M20,0.2C13.7,0.2,6.7,3.9,0,10.6l20,29.3L30,30.1L16.7,10.6c9.3-6.7,22.7-6.7,32,0L35.4,29.9L39.9,36l20-29.3C53.3,3.9,46.3,0.2,39.9,0.2H20z"
            fill="currentColor"
          />
          <text
            x="55"
            y="27"
            fontFamily="Arial Black"
            fontWeight="bold"
            fontSize="24"
            fill="currentColor"
          >
            ALMET
          </text>
          <text
            x="55"
            y="38"
            fontFamily="Arial"
            fontSize="12"
            fill="currentColor"
          >
            HOLDING
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <svg width="30" height="30" viewBox="0 0 40 40" className="text-blue-500">
        <path
          d="M20,0.2C13.7,0.2,6.7,3.9,0,10.6l20,29.3L30,30.1L16.7,10.6c9.3-6.7,22.7-6.7,32,0L35.4,29.9L39.9,36l20-29.3C53.3,3.9,46.3,0.2,39.9,0.2H20z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
};

export default Logo;
// import React from "react";
// import Image from "next/image";
// import logo from "@/assets/logo (2).png";
// import favicon from "@/assets/favicon.png";

// const Logo = ({ collapsed = false }) => {
//   if (!collapsed) {
//     return (
//       <div className="flex items-center">
//         <Image
//           src={logo}
//           alt="Almet Holding Logo"
//           width={160}
//           height={20}
//           priority
//           className="object-contain"
//         />
//       </div>
//     );
//   }

//   return (
//     <div className="flex items-center justify-center">
//       <Image
//         src={favicon}
//         alt="Almet Holding Favicon"
//         width={30}
//         height={30}
//         priority
//         className="object-contain"
//       />
//     </div>
//   );
// };

// export default Logo;
