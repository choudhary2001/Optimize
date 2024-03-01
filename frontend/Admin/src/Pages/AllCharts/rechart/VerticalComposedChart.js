import React from "react";
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Area,
    ResponsiveContainer
} from "recharts";

// const data = [
//     {
//         name: "Page A",
//         uv: 590,
//         pv: 800,
//         amt: 1400,
//         cnt: 490
//     },
//     {
//         name: "Page B",
//         uv: 868,
//         pv: 967,
//         amt: 1506,
//         cnt: 590
//     },
//     {
//         name: "Page C",
//         uv: 1397,
//         pv: 1098,
//         amt: 989,
//         cnt: 350
//     },
//     {
//         name: "Page D",
//         uv: 1480,
//         pv: 1200,
//         amt: 1228,
//         cnt: 480
//     },
//     {
//         name: "Page E",
//         uv: 1520,
//         pv: 1108,
//         amt: 1100,
//         cnt: 460
//     },
//     {
//         name: "Page F",
//         uv: 1400,
//         pv: 680,
//         amt: 1700,
//         cnt: 380
//     }
// ];

const VerticalComposedChart = ({ parts1DataMap, parts2DataMap, parts3DataMap, dateMap }) => {

    // console.log(parts1DataMap, parts2DataMap, parts3DataMap);

    // Assuming these are your three lists
    const oeeeList1 = parts1DataMap.capacityUtilizationList || [];
    const oeeeList2 = parts2DataMap.capacityUtilizationList || [];
    const oeeeList3 = parts3DataMap.capacityUtilizationList || [];

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
            "Capacity Utilisation": isNaN(average) ? 0 : parseFloat(average.toFixed(2)),
        };
    });

    // console.log(data);


    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <ComposedChart
                    layout="vertical"
                    data={data}
                    margin={{
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 20
                    }}
                >
                    <CartesianGrid stroke="#f5f5f5" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" scale="band" />
                    <Tooltip />
                    <Legend />
                    {/* <Area dataKey="amt" fill="#8884d8" stroke="#8884d8" /> */}
                    <Bar dataKey="Capacity Utilisation" barSize={20} fill="#413ea0" />
                    {/* <Line dataKey="uv" stroke="#ff7300" /> */}
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}

export default VerticalComposedChart;