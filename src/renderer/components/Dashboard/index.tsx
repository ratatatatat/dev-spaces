import React from 'react';
import './index.css';

const Layout = ({ leftSection, rightSection }: {
    leftSection: React.ReactNode;
    rightSection: React.ReactNode;
}) => {
  return (
    <div className="layout">
      <div className="left-section">
        {leftSection}
      </div>
      <div className="right-section">
        {rightSection}
      </div>
    </div>
  );
};

export default Layout;