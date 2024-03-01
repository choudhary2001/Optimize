import React, { useState, useEffect } from 'react';
import UsePanel from "./UserPanel";
import OrderStatus from "./OrderStatus";
import Notifications from "./Notifications";
import SocialSource from "./SocialSource";
import OverView from "./OverView";
import RevenueByLocation from "./RevenueByLocation";
import LatestTransation from "./LatestTransation";

import { Container, Row, Col, Card, CardBody, CardTitle, Button } from "reactstrap";

import SimpleLineChart from '../AllCharts/rechart/SimpleLineChart';
import SimpleAreaChart from '../AllCharts/rechart/SimpleAreaChart';
import MixBarChart from '../AllCharts/rechart/MixBarChart';
import VerticalComposedChart from '../AllCharts/rechart/VerticalComposedChart';

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

const Dashboard = () => {

  const authToken = JSON.parse(localStorage.getItem("authUser")).token;

  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState('');

  const fetchUser = async () => {
    try {
      const authToken = JSON.parse(localStorage.getItem("authUser")).token;
      // Fetch data from your API
      const response = await fetch('http://13.235.76.12:3003/api/user/profile', {
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${authToken}` // Replace with your actual token
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);

        setSelectedMachine(data.machine_name);
      } else if (response.status === 401) {
        // Unauthorized: Log out the user
        localStorage.removeItem("authUser");
        localStorage.removeItem("admin");
      } else {
        console.error('Error fetching data:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  const [partsData, setPartsData] = useState({
    good_parts: 0,
    bad_parts: 0,
    total_parts: 0,
    total_running_hours: 0,
    good_parts_ago: 0,
    bad_parts_ago: 0,
    total_parts_ago: 0,
    total_running_hours_ago: 0,
    total_parts_1st_shift: 0,
    total_parts_2st_shift: 0,
    total_parts_3st_shift: 0,

  });

  const [totalpartsData, setTotalPartsData] = useState({
    total_parts_1st_shift: 0,
    total_parts_2st_shift: 0,
    total_parts_3st_shift: 0
  });

  const fetchMachines = async () => {
    try {
      // Fetch data from your API
      const response = await fetch('http://13.235.76.12:3003/api/user/machine/name', {
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${authToken}`
        },
      });

      if (response.ok) {
        const data = await response.json();


        // Check if the arrays are defined before setting them in the state
        setMachines(data);

        console.log(data);
      } else if (response.status === 401) {
        // Unauthorized: Log out the user
        localStorage.removeItem("authUser");
        localStorage.removeItem("admin");
      } else {
        console.error('Error fetching data:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  const fetchMachineData = async () => {
    try {
      // Fetch data from your API
      const response = await fetch('http://13.235.76.12:3003/api/machine/data', {
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${authToken}` // Replace with your actual token
        },
      });

      if (response.ok) {
        const data = await response.json();
        const part_data = {
          'good_parts': data.good_parts ? data.good_parts : 0,
          'bad_parts': data.bad_parts ? data.bad_parts : 0,
          'total_parts': data.total_parts ? data.total_parts : 0,
          'total_running_hours': data.total_running_hours ? data.total_running_hours : 0,
          'good_parts_ago': data.good_parts_ago ? data.good_parts_ago : 0,
          'bad_parts_ago': data.bad_parts_ago ? data.bad_parts_ago : 0,
          'total_parts_ago': data.total_parts_ago ? data.total_parts_ago : 0,
          'total_running_hours_ago': data.total_running_hours_ago ? data.total_running_hours_ago : 0,
          'total_parts_1st_shift': data.total_parts_1st_shift ? data.total_parts_1st_shift : 0,
          'total_parts_2st_shift': data.total_parts_2st_shift ? data.total_parts_2st_shift : 0,
          'total_parts_3st_shift': data.total_parts_3st_shift ? data.total_parts_3st_shift : 0,
        }
        const total_part_data = {

          'total_parts_1st_shift': data.total_parts_1st_shift ? data.total_parts_1st_shift : 0,
          'total_parts_2st_shift': data.total_parts_2st_shift ? data.total_parts_2st_shift : 0,
          'total_parts_3st_shift': data.total_parts_3st_shift ? data.total_parts_3st_shift : 0,
        }
        setPartsData(part_data);
        setTotalPartsData(total_part_data);
        console.log(data);
      } else if (response.status === 401) {
        // Unauthorized: Log out the user
        localStorage.removeItem("authUser");
        localStorage.removeItem("admin");
      } else {
        console.error('Error fetching data:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchMachines();
    const fetchDataInterval = setInterval(() => {
      fetchMachineData();
    }, 3000); // Fetch data every 3 seconds

    // Cleanup the interval when the component is unmounted or when the dependency array changes
    return () => clearInterval(fetchDataInterval);
  }, []);


  const handleMachineChange = async (event) => {
    const selectedMachineId = event.target.value;

    try {
      const response = await fetch('http://13.235.76.12:3003/api/user/machine/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          machineId: selectedMachineId,
        }),
      });

      if (response.ok) {
        // Handle success (optional)
        fetchUser();
        fetchMachines();
        fetchMachineData();
        console.log('Machine saved successfully.');
      } else {
        // Handle errors (optional)
        console.error('Error saving machine:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving machine:', error);
    }
  };

  console.log(partsData.good_parts);



  const [partsDataMap, setPartsDataMap] = useState({
    goodPartsList: [],
    badPartsList: [],
    dateTimeList: [],

  });

  const fetchMachineDatamap = async () => {
    try {
      // Fetch data from your API
      const response = await fetch('http://13.235.76.12:3003/api/machine/chart', {
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${authToken}` // Replace with your actual token
        },
      });

      if (response.ok) {
        const data = await response.json();
        const part_data = {
          'goodPartsList': data.goodPartsList ? data.goodPartsList : [],
          'badPartsList': data.badPartsList ? data.badPartsList : [],
          'dateTimeList': data.dateTimeList ? data.dateTimeList : [],
        }

        setPartsDataMap(part_data);
        console.log(data);
      } else if (response.status === 401) {
        // Unauthorized: Log out the user
        localStorage.removeItem("authUser");
        localStorage.removeItem("admin");
      } else {
        console.error('Error fetching data:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    const fetchDataIntervalmap = setInterval(() => {
      fetchMachineDatamap();
    }, 3000); // Fetch data every 3 seconds

    // Cleanup the interval when the component is unmounted or when the dependency array changes
    return () => clearInterval(fetchDataIntervalmap);
  }, []);



  const [isDownloading, setIsDownloading] = useState(false);

  // const downloadFile = async (url, filename) => {
  //   try {
  //     const response = await fetch(url, {
  //       responseType: 'blob',
  //       headers: {
  //         "Content-Type": "application/json",
  //         'Authorization': `Bearer ${authToken}` // Replace with your actual token
  //       },
  //     });
  //     const blob = await response.blob();

  //     // Create a link element and trigger a click to download the file
  //     const a = document.createElement('a');
  //     a.href = window.URL.createObjectURL(blob);
  //     a.download = 'shift_metrics.xlsx';
  //     document.body.appendChild(a);
  //     a.click();
  //     document.body.removeChild(a);

  //     setIsDownloading(false);

  //   } catch (error) {
  //     console.error('Error downloading file:', error);
  //     // Display an error message to the user
  //   }
  // };

  // const handleDownloadClick = async () => {
  //   setIsDownloading(true);

  //   try {
  //     await downloadFile('http://13.235.76.12:3003/api/data/performance/download', 'report.xlsx');
  //   } catch (error) {
  //     // Handle errors appropriately
  //   } finally {
  //     setIsDownloading(false);
  //   }
  // };


  console.log(partsData.good_parts);

  document.title = "Dashboard | OptiMize ";
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="OptiMize" breadcrumbItem="Dashboard" />
          {/* <label>Select Machine: </label>
          <select value={selectedMachine} onChange={handleMachineChange} style={{ padding: "3px", margin: "10px", borderRadius: "10px" }}>
            <option value="">Select a machine</option>
            {machines.map((machine) => (
              <option key={machine._id} value={machine._id}>
                {machine.machine_name}
              </option>
            ))}
          </select> */}
          {/* <Button onClick={handleDownloadClick} disabled={isDownloading}>
            {isDownloading ? 'Downloading...' : 'Download Report'}
          </Button> */}

          {/* User Panel Charts */}

          <UsePanel partsData={partsData} />

          <Row>
            {/* Overview Chart */}
            <OverView partsDataMap={partsDataMap} />
            {/* Social Source Chart */}
            <SocialSource totalpartsData={totalpartsData} />
          </Row>


          {/* <Row> */}
          {/* Order Stats */}
          {/* <OrderStatus /> */}
          {/* Notifications */}
          {/* <Notifications /> */}
          {/* Revenue by Location Vector Map */}
          {/* <RevenueByLocation /> */}
          {/* </Row> */}

          {/* Latest Transaction Table */}
          {/* <LatestTransation /> */}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Dashboard;
