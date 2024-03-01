import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

// const data = [
//     {
//         name: "Page A",
//         uv: 4000,
//         pv: 2400,
//         amt: 2400
//     },
//     {
//         name: "Page B",
//         uv: 3000,
//         pv: 1398,
//         amt: 2210
//     },
//     {
//         name: "Page C",
//         uv: 2000,
//         pv: 9800,
//         amt: 2290
//     },
//     {
//         name: "Page D",
//         uv: 2780,
//         pv: 3908,
//         amt: 2000
//     },
//     {
//         name: "Page E",
//         uv: 1890,
//         pv: 4800,
//         amt: 2181
//     },
//     {
//         name: "Page F",
//         uv: 2390,
//         pv: 3800,
//         amt: 2500
//     },
//     {
//         name: "Page G",
//         uv: 3490,
//         pv: 4300,
//         amt: 2100
//     }
// ];

const MixBarChart = ({ parts1DataMap, parts2DataMap, parts3DataMap, dateMap }) => {
    // console.log(parts1DataMap, parts2DataMap, parts3DataMap);

    // Assuming these are your three lists
    const oeeeList1 = parts1DataMap.scraprateList || [];
    const oeeeList2 = parts2DataMap.scraprateList || [];
    const oeeeList3 = parts3DataMap.scraprateList || [];

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
            "First Shift": oeeeList1[index] || 0,
            "Second Shift": oeeeList2[index] || 0,
            "Third Shift": oeeeList3[index] || 0,
        };
    });

    // console.log(data);
    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart
                    data={data}
                    margin={{
                        top: 20,
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
                    <Bar dataKey="First Shift" stackId="a" fill="#8884d8" />
                    <Bar dataKey="Third Shift" stackId="a" fill="#82ca9d" />
                    <Bar dataKey="Second Shift" fill="#ffc658" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default MixBarChart;