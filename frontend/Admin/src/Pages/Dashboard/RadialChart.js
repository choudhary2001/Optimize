import React from "react";
import ReactApexChart from "react-apexcharts";

const RadialChart = ({ totalpartsData }) => {
  const series = [totalpartsData.total_parts_1st_shift, totalpartsData.total_parts_2st_shift, totalpartsData.total_parts_3st_shift];
  const add_total_parts = totalpartsData.total_parts_1st_shift + totalpartsData.total_parts_2st_shift + totalpartsData.total_parts_3st_shift;
  const options = {
    chart: {
      height: 350,
      type: "radialBar",
    },
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 10,
          size: "45%",
        },
        track: {
          show: true,
          strokeWidth: "70%",
          margin: 12,
        },
        dataLabels: {
          name: {
            fontSize: "27px",
          },
          value: {
            fontSize: "20px",
          },
          total: {
            show: true,
            label: "Total",
            formatter: function (w) {
              // By default this function returns the average of all series. The below is just an example to show the use of custom formatter function
              return add_total_parts;
            },
          },
        },
      },
    },
    labels: ["Facebook", "Twitter", "Instagram"],
    colors: ["#099680", "#4aa3ff", "#5664d2"],
  };
  return (
    <React.Fragment>
      <ReactApexChart
        options={options}
        series={series}
        type="radialBar"
        height="350"
        className="apex-charts"
      />
    </React.Fragment>
  );
};

export default RadialChart;
