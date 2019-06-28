import React from "react";
import PropTypes from "prop-types";

const Collapse = props => {
  const { collapse } = props;
  return <>{collapse ? null : props.children}</>;
};

Collapse.propTypes = {
  collapse: PropTypes.bool.isRequired
};

Collapse.defaultProps = {
  collapse: false
};

export default Collapse;
