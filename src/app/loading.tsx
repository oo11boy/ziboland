import React from "react";
import { PulseLoader } from "react-spinners";

export default function loading() {
  return (
    <>
      <div className="loading-container ">
     
          <PulseLoader color="#b7adad" speedMultiplier={1} size={10} />
     
      </div>
    </>
  );
}
