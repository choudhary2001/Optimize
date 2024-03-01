import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";



const SimpleLineChart = ({ parts1DataMap, parts2DataMap, parts3DataMap, dateMap }) => {
  // console.log(parts1DataMap, parts2DataMap, parts3DataMap);

  // Assuming these are your three lists
  const oeeeList1 = parts1DataMap.oeeeList || [];
  const oeeeList2 = parts2DataMap.oeeeList || [];
  const oeeeList3 = parts3DataMap.oeeeList || [];

  // console.log(dateMap);

  // Ensure each list has the same length
  const maxLength = Math.max(oeeeList1.length, oeeeList2.length, oeeeList3.length);

  // Process the data to create the desired format
  const data = Array.from({ length: maxLength }, (_, index) => {
    const sum =
      (oeeeList1[index] || 0) +
      (oeeeList2[index] || 0) +
      (oeeeList3[index] || 0);

    const average = sum / 3; // Divide by the number of lists

    const dateTime = dateMap.dateTimeList[index] || '';

    return {
      name: dateTime,
      oee: isNaN(average) ? 0 : average,
    };
  });

  // console.log(data);


  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />

          <Line type="monotone" dataKey="oee" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SimpleLineChart;