import React from "react";


const GradingHeader = () => {

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-xl font-bold text-almet-cloud-burst dark:text-white">
                Employee Grading System
              </h1>
              <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai mt-1">
                Manage salary grades and compensation structures
              </p>
             
            </div>
            
          </div>
        </div>
          
  );
};

export default GradingHeader;