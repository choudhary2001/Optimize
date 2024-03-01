import React, { useState, useEffect } from 'react';



import { Container, Row, Col, Card, CardBody, CardTitle, Button } from "reactstrap";


//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

const MainPage = () => {

    const authToken = JSON.parse(localStorage.getItem("authUser")).token;

    const [machines, setMachines] = useState({});
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


    const handleMachineChange = async (selectedMachineId) => {


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
                window.location.href = '/dashboard'

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

    document.title = "Machines | OptiMize ";
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Breadcrumbs title="OptiMize" breadcrumbItem="Machines" />

                    {/* User Panel Charts */}

                    <Row>
                        {machines && (
                            <>
                                {Object.keys(machines).map((machineName, index) => (
                                    <Col xl={3} sm={6} key={index}>
                                        <Card
                                            // style={{ backgroundColor: machines[machineName].din1Value === 1 ? 'green' : 'red', cursor: "pointer" }}
                                            onClick={() => handleMachineChange(machines[machineName].machine_name_id)}
                                        >

                                            <CardBody>
                                                <div className="d-flex text-muted">
                                                    <div className="flex-shrink-0 me-3 align-self-center">
                                                        <div className="">
                                                            <div className="">
                                                                {machines[machineName].machine_file && (
                                                                    <>
                                                                        <img src={`http://13.235.76.12:3003/images/${machines[machineName].machine_file}`} height="48" width="45" style={{ borderRadius: "25px" }} />
                                                                        {/* <img src={`data:image/jpeg;base64,${machine.logo.toString('base64')}`} alt={machine.machine_name} /> */}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-grow-1 overflow-hidden" style={{ display: "flex", alignItems: "center" }}>
                                                        <h5 className=""
                                                        // style={{ color: machines[machineName].din1Value === 1 ? 'black' : 'white' }}
                                                        >{machineName}</h5>
                                                    </div>

                                                    <div style={{ display: "flex", alignItems: "center" }}>
                                                        {machines[machineName].din1Value === 1 ? <svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 512 512"><path fill="#11ff00" d="M256 48C141.31 48 48 141.31 48 256s93.31 208 208 208s208-93.31 208-208S370.69 48 256 48m108.25 138.29l-134.4 160a16 16 0 0 1-12 5.71h-.27a16 16 0 0 1-11.89-5.3l-57.6-64a16 16 0 1 1 23.78-21.4l45.29 50.32l122.59-145.91a16 16 0 0 1 24.5 20.58" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 24 24"><path fill="#ff0000" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10m0-11.414L9.172 7.757L7.757 9.172L10.586 12l-2.829 2.828l1.415 1.415L12 13.414l2.828 2.829l1.415-1.415L13.414 12l2.829-2.828l-1.415-1.415z" /></svg>

                                                        }

                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                ))}
                            </>
                        )}

                    </Row>

                </Container>
            </div>
        </React.Fragment>
    );
};

export default MainPage;
