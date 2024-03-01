import React from "react";
import ReactApexChart from "react-apexcharts";

const LineColumnArea = ({ partsDataMap }) => {
  console.log(partsDataMap);
  if (
    !partsDataMap ||
    !Array.isArray(partsDataMap.goodPartsList) ||
    !Array.isArray(partsDataMap.badPartsList) ||
    !Array.isArray(partsDataMap.dateTimeList)
  ) {
    // Handle the case where the data is not available or not in the expected format
    return null; // You can render an error message or a loading indicator here
  }

  console.log(
    partsDataMap.goodPartsList.map((value) => ({ y: value }))
  );
  const LineColumnAreaData = {
    series: [
      {
        name: "Good Parts",
        type: "column",
        data: partsDataMap.goodPartsList,
      },
      {
        name: "Bad Parts",
        type: "line",
        data: partsDataMap.badPartsList,
      },
    ],
    options: {
      chart: {
        height: 350,
        type: "line",
        stacked: false,
        toolbar: {
          show: false,
        },
      },
      stroke: {
        width: [0, 1, 1],
        dashArray: [0, 0, 5],
        curve: "smooth",
      },
      plotOptions: {
        bar: {
          columnWidth: "18%",
        },
      },
      legend: {
        show: false,
      },
      colors: ["#0ab39c", "rgb(251, 77, 83)"],

      fill: {
        opacity: [0.85, 0.25, 1],
        gradient: {
          inverseColors: false,
          shade: "light",
          type: "vertical",
          opacityFrom: 0.85,
          opacityTo: 0.55,
          stops: [0, 100, 100, 100],
        },
      },
      labels: partsDataMap.dateTimeList, // Corrected this line
      markers: {
        size: 0,
      },
      xaxis: {
        type: "category", // Change from "month" to "category"
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: function (y) {
            if (typeof y !== "undefined") {
              return y.toFixed(0) + " points";
            }
            return y;
          },
        },
      },
      grid: {
        borderColor: "#f1f1f1",
      },
    },
  };

  return (
    <React.Fragment>
      <ReactApexChart
        options={LineColumnAreaData.options}
        series={LineColumnAreaData.series}
        type="line"
        height="350"
        stacked="false"
        className="apex-charts"
      />
    </React.Fragment>
  );
};

export default LineColumnArea;
