import React from "react";
import "./StyleGuide.less";

const colorBlocks = [
  "primary",
  "info",
  "success",
  "highlight",
  "warning",
  "error",
  "normal"
];
export default () => (
  <div className="sg-container">
    {colorBlocks.map((v, i) => (
      <div key={i} className={"sg-color-block " + v}>
        <p>{`@${v}-color`}</p>
      </div>
    ))}
  </div>
);
