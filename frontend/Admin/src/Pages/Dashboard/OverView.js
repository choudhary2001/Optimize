import React, { useState, useEffect } from 'react';
import LineColumnArea from './LineColumnArea';
import {
    Card,
    CardBody,
    Col,
} from "reactstrap";

const OverView = ({ partsDataMap }) => {
    const [selectedTimeRange, setSelectedTimeRange] = useState('All');
    const [filteredData, setFilteredData] = useState(partsDataMap);

    useEffect(() => {
        filterDataByTimeRange();
    }, [selectedTimeRange, partsDataMap]);

    const filterDataByTimeRange = () => {
        const currentDate = new Date(); // Current date
        let startDate;

        switch (selectedTimeRange) {
            case '1M':
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
                break;
            case '6M':
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, currentDate.getDate());
                break;
            case '1Y':
                startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
                break;
            default:
                startDate = new Date(0); // Set to a very early date for 'All'
        }

        const filteredDateTimeList = partsDataMap.dateTimeList.filter(data => new Date(data) >= startDate);

        console.log(selectedTimeRange);

        const filteredData = {
            goodPartsList: partsDataMap.goodPartsList.slice(0, filteredDateTimeList.length),
            badPartsList: partsDataMap.badPartsList.slice(0, filteredDateTimeList.length),
            dateTimeList: filteredDateTimeList,
        };
        console.log(filteredData);
        setFilteredData(filteredData);
    };

    return (
        <Col xl={8} style={{ marginBottom: "1.5rem" }}>
            <Card style={{ height: "100%" }}>
                <CardBody>
                    <div className="d-flex align-items-center">
                        <div className="flex-grow-1">
                            <h5 className="card-title">Overview</h5>
                        </div>
                        <div className="flex-shrink-0">
                            <div>
                                <select
                                    style={{ padding: "3px", borderRadius: "10px" }}
                                    value={selectedTimeRange}
                                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                                >
                                    <option value="All">All</option>
                                    <option value="1M">1 Month</option>
                                    <option value="6M">6 Months</option>
                                    <option value="1Y">1 Year</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div>
                        <LineColumnArea partsDataMap={filteredData} />
                    </div>
                </CardBody>
            </Card>
        </Col>
    );
};

export default OverView;
