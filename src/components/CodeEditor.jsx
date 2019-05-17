import React, { useState } from "react";
import PropTypes from "prop-types";

import MonacoEditor from "react-monaco-editor";

const CodeEditor = props => {
  const { onChange, value, width, height, theme, language } = props;
  return (
    <div>
      <MonacoEditor
        onChange={onChange}
        value={value}
        height={height}
        width={width}
        theme={theme}
        language={language}
      />
    </div>
  );
};

// language="json"
// height="300"
// width="400"
// theme="vs-dark"
// onChange={dataChanged}

CodeEditor.propTypes = {
  theme: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  height: PropTypes.string.isRequired,
  width: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func
};

CodeEditor.defaultProps = {
  theme: "vs-dark",
  language: "json",
  width: "400",
  height: "200"
};

export default CodeEditor;
