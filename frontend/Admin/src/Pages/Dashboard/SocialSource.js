import React from "react";
import RadialChart from "./RadialChart";

import { Card, CardBody, Col, Row } from "reactstrap";

import { SocialSourceData } from "../../CommonData/Data/index";

const SocialSource = ({ totalpartsData }) => {
  return (
    <React.Fragment>
      <Col xl={4}>
        <Card>
          <CardBody>
            <div className="d-flex  align-items-center">
              <div className="flex-grow-1">
                <h5 className="card-title">Per Day Production</h5>
              </div>

            </div>
            {/* RadialChart */}
            <RadialChart totalpartsData={totalpartsData} />
            <Row>
              {/* {SocialSourceData.map((item, key) => (
                <div key={key} className="col-4">
                  <div className="social-source text-center mt-3">
                    <div className="avatar-xs mx-auto mb-3">
                      <span
                        className={
                          "avatar-title rounded-circle font-size-18 bg-" +
                          item.bgcolor
                        }
                      >
                        <i className={item.icon + " text-white"}></i>
                      </span>
                    </div>
                    <h5 className="font-size-15">{item.title}</h5>
                    <p className="text-muted mb-0">{item.count} sales</p>
                  </div>
                </div>
              ))} */}
              <div className="col-4">
                <div className="social-source text-center mt-3">

                  <h5 className="font-size-15">1st Shift</h5>
                  <p className="text-muted mb-0">{totalpartsData.total_parts_1st_shift}</p>
                </div>
              </div>
              <div className="col-4">
                <div className="social-source text-center mt-3">

                  <h5 className="font-size-15">2nd Shift</h5>
                  <p className="text-muted mb-0">{totalpartsData.total_parts_2st_shift}</p>
                </div>
              </div>
              <div className="col-4">
                <div className="social-source text-center mt-3">

                  <h5 className="font-size-15">3rd Shift</h5>
                  <p className="text-muted mb-0">{totalpartsData.total_parts_3st_shift}</p>
                </div>
              </div>
            </Row>
          </CardBody>
        </Card>
      </Col>
    </React.Fragment>
  );
};

export default SocialSource;
