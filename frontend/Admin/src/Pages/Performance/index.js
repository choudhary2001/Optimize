import React, { useState, useEffect } from 'react';

import { Container, Row, Col, Card, CardBody, CardTitle, Button } from "reactstrap";

import SimpleLineChart from '../AllCharts/rechart/SimpleLineChart';
import SimpleAreaChart from '../AllCharts/rechart/SimpleAreaChart';
import MixBarChart from '../AllCharts/rechart/MixBarChart';
import VerticalComposedChart from '../AllCharts/rechart/VerticalComposedChart';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
import axios from 'axios';

const Performance = () => {
    const authToken = JSON.parse(localStorage.getItem("authUser")).token;
    const [machines, setMachines] = useState([]);
    const [selectedMachine, setSelectedMachine] = useState('');

    const [isDownloading, setIsDownloading] = useState(false);

    // const downloadFile = async (url, filename) => {
    //     try {
    //         const response = await fetch(url, {
    //             responseType: 'blob',
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 'Authorization': `Bearer ${authToken}` // Replace with your actual token
    //             },
    //         });
    //         const blob = await response.blob();

    //         // Create a link element and trigger a click to download the file
    //         const a = document.createElement('a');
    //         a.href = window.URL.createObjectURL(blob);
    //         a.download = 'shift_metrics.xlsx';
    //         document.body.appendChild(a);
    //         a.click();
    //         document.body.removeChild(a);

    //         setIsDownloading(false);

    //     } catch (error) {
    //         console.error('Error downloading file:', error);
    //         // Display an error message to the user
    //     }
    // };

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
                //console.log(data);

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


    const [parts1DataMap, setParts1DataMap] = useState({
        goodPartsList: [],
        badPartsList: [],
        totalPartsList: [],
        dateTimeList: [],
        oeeeList: [],
        teepList: [],
        scraprateList: [],
        capacityUtilizationList: []
    });

    const [parts2DataMap, setParts2DataMap] = useState({
        goodPartsList: [],
        badPartsList: [],
        totalPartsList: [],
        dateTimeList: [],
        oeeeList: [],
        teepList: [],
        scraprateList: [],
        capacityUtilizationList: []
    });

    const [parts3DataMap, setParts3DataMap] = useState({
        goodPartsList: [],
        badPartsList: [],
        totalPartsList: [],
        dateTimeList: [],
        oeeeList: [],
        teepList: [],
        scraprateList: [],
        capacityUtilizationList: []
    });

    const [dateMap, setdateMap] = useState({
        dateTimeList: [],
    })

    const [allData, setAllData] = useState([]);

    const downloadExcel = async () => {
        try {
            // Fetch the data from your API
            const response = await fetch('http://13.235.76.12:3003/api/data/performance', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`, // Include your authentication token if needed
                },
            });
            console.log(response)
            // Check if the response is successful
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(new Blob([blob]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'shift_metrics.xlsx');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else if (response.status === 401) {
                // Unauthorized: Handle authentication error
                console.error('Authentication error');
            } else {
                // Handle other errors
                console.error('Error fetching data:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };


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

                //console.log(data);
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
            const response = await fetch('http://13.235.76.12:3003/api/data/performance', {
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${authToken}` // Replace with your actual token
                },
            });

            if (response.ok) {
                const data = await response.json();

                setAllData(data);

                // Check if the arrays are defined before setting them in the state
                const updatedData1Map = {
                    oeeeList: data.shiftMetrics6to14.oeeeList || [],
                    teepList: data.shiftMetrics6to14.teepList || [],
                    scraprateList: data.shiftMetrics6to14.scraprateList || [],
                    capacityUtilizationList: data.shiftMetrics6to14.capacityUtilizationList || [],
                    dateTimeList: data.shiftMetrics6to14.dateTimeList || [],
                    goodPartsList: data.shiftMetrics6to14.goodPartsList || [],
                    badPartsList: data.shiftMetrics6to14.badPartsList || [],
                    totalPartsList: data.shiftMetrics6to14.totalPartsList || [],
                };

                setParts1DataMap(updatedData1Map);

                //console.log(updatedData1Map);

                const updatedData2Map = {
                    oeeeList: data.shiftMetrics14to22.oeeeList || [],
                    teepList: data.shiftMetrics14to22.teepList || [],
                    scraprateList: data.shiftMetrics14to22.scraprateList || [],
                    capacityUtilizationList: data.shiftMetrics14to22.capacityUtilizationList || [],
                    dateTimeList: data.shiftMetrics14to22.dateTimeList || [],
                    goodPartsList: data.shiftMetrics14to22.goodPartsList || [],
                    badPartsList: data.shiftMetrics14to22.badPartsList || [],
                    totalPartsList: data.shiftMetrics14to22.totalPartsList || [],
                };

                setParts2DataMap(updatedData2Map);

                //console.log(updatedData2Map);

                const updatedData3Map = {
                    oeeeList: data.shiftMetrics22to6.oeeeList || [],
                    teepList: data.shiftMetrics22to6.teepList || [],
                    scraprateList: data.shiftMetrics22to6.scraprateList || [],
                    capacityUtilizationList: data.shiftMetrics22to6.capacityUtilizationList || [],
                    dateTimeList: data.shiftMetrics22to6.dateTimeList || [],
                    goodPartsList: data.shiftMetrics22to6.goodPartsList || [],
                    badPartsList: data.shiftMetrics22to6.badPartsList || [],
                    totalPartsList: data.shiftMetrics22to6.totalPartsList || [],
                };

                setParts3DataMap(updatedData3Map);

                const updateDateTime = {
                    dateTimeList: data.shiftMetricsallshift.dateTimeList || [],
                };

                setdateMap(updateDateTime);

                //console.log(updatedData3Map);
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



    // const handleDownloadClick = async () => {
    //     setIsDownloading(true);

    //     try {
    //         await downloadFile('http://13.235.76.12:3003/api/data/performance/download', 'report.xlsx');
    //     } catch (error) {
    //         // Handle errors appropriately
    //     } finally {
    //         setIsDownloading(false);
    //     }
    // };


    document.title = "Performance ";
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Breadcrumbs title="OptiMize" breadcrumbItem="Performance" />
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
                    <Row>
                        <Col xl={6}>
                            <Card>
                                <CardBody>
                                    <CardTitle className="mb-4">OVER ALL EQUIPMENT EFFICIENCY (OEE)</CardTitle>
                                    <SimpleLineChart parts1DataMap={parts1DataMap} parts2DataMap={parts2DataMap} parts3DataMap={parts3DataMap} dateMap={dateMap} />
                                </CardBody>
                            </Card>
                        </Col>
                        <Col xl={6}>
                            <Card>
                                <CardBody>
                                    <CardTitle className="mb-4">TOTAL EQUIPMENT EFFECTIVE PERFORMANCE (TEEP)</CardTitle>
                                    <SimpleAreaChart parts1DataMap={parts1DataMap} parts2DataMap={parts2DataMap} parts3DataMap={parts3DataMap} dateMap={dateMap} />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col xl={6}>
                            <Card>
                                <CardBody>
                                    <CardTitle className="mb-4">SCRAP RATE</CardTitle>
                                    <MixBarChart parts1DataMap={parts1DataMap} parts2DataMap={parts2DataMap} parts3DataMap={parts3DataMap} dateMap={dateMap} />
                                </CardBody>
                            </Card>
                        </Col>
                        <Col xl={6}>
                            <Card>
                                <CardBody>
                                    <CardTitle className="mb-4">CAPACITY UTILIZATION</CardTitle>
                                    <VerticalComposedChart parts1DataMap={parts1DataMap} parts2DataMap={parts2DataMap} parts3DataMap={parts3DataMap} dateMap={dateMap} />
                                </CardBody>
                            </Card>
                        </Col>
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

export default Performance;
