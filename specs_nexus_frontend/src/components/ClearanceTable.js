import React from 'react';

const ClearanceTable = ({ clearanceData }) => {
  return (
    <table className="clearance-table">
      <thead>
        <tr>
          <th>Requirement</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {clearanceData.map((item, index) => (
          <tr key={index}>
            <td>{item.requirement}</td>
            <td>{item.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ClearanceTable;
