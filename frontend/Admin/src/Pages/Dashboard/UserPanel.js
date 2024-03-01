import React from "react";
import { Card, CardBody, Col, Row } from "reactstrap";

import RadialChart1 from "./userpanelChart1";
import RadialChart2 from "./userpanelChart2";
import RadialChart3 from "./userpanelChart3";

const UserPanel = ({ partsData }) => {
  console.log(partsData);
  const per_total_running_hour = (partsData.total_running_hours / 8) * 100;
  const per_total_running_hour_ago = (partsData.total_running_hours_ago / 8) * 100;
  const diff_total_running_hour = per_total_running_hour - per_total_running_hour_ago;
  let per_good_parts = 0;
  let per_good_parts_ago = 0;
  if (partsData.total_parts !== 0) {
    per_good_parts = (partsData.good_parts / partsData.total_parts) * 100;

  }
  else {
    per_good_parts = 0;
  }


  if (partsData.total_parts_ago !== 0) {
    per_good_parts_ago = (partsData.good_parts_ago / partsData.total_parts_ago) * 100;
    per_good_parts_ago = per_good_parts_ago - per_bad_parts;
  }
  else {
    per_good_parts_ago = 0;
  }

  let per_bad_parts = 0;
  if (partsData.total_parts !== 0) {
    per_bad_parts = (partsData.bad_parts / partsData.total_parts) * 100;
  }
  else {
    per_bad_parts = 0;
  }

  let per_bad_parts_ago = 0;
  if (partsData.total_parts_ago !== 0) {
    per_bad_parts_ago = (partsData.bad_parts_ago / partsData.total_parts_ago) * 100;
    per_bad_parts_ago = per_bad_parts_ago - per_bad_parts;
  }
  else {
    per_bad_parts_ago = 0;
  }

  let per_total_parts_ago = 0;
  if (partsData.total_parts !== 0) {
    per_total_parts_ago = (partsData.total_parts_ago - partsData.total_parts / partsData.total_parts) * 100;
  }
  else {
    per_total_parts_ago = 0;
  }

  console.log(per_bad_parts, per_good_parts, per_bad_parts_ago, per_good_parts_ago, per_total_parts_ago, per_total_running_hour, per_total_running_hour_ago)
  return (
    <React.Fragment>
      <Row>
        <Col xl={3} sm={6}>
          <Card>
            <CardBody>
              <div className="d-flex text-muted">
                <div className="flex-shrink-0 me-3 align-self-center">
                  <div id="radialchart-1" className="apex-charts" dir="ltr">
                    <RadialChart1 per_total_running_hour={per_total_running_hour} />
                  </div>
                </div>

                <div className="flex-grow-1 overflow-hidden">
                  <p className="mb-1">Running hours</p>
                  <h5 className="mb-3">{partsData.total_running_hours}</h5>
                  <p className="text-truncate mb-0">
                    <span className={diff_total_running_hour < 0 ? "text-danger me-2" : "text-success me-2"}>
                      {diff_total_running_hour}%
                      <i className={diff_total_running_hour < 0 ? "ri-arrow-right-down-line align-bottom ms-1" : "ri-arrow-right-up-line align-bottom ms-1"}></i>
                    </span>
                    From previous
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xl={3} sm={6}>
          <Card>
            <CardBody>
              <div className="d-flex">
                <div className="flex-shrink-0 me-3 align-self-center">
                  <RadialChart2 good_parts={per_bad_parts}
                    id="radialchart-2"
                    className="apex-charts"
                    dir="ltr"
                  />
                </div>

                <div className="flex-grow-1 overflow-hidden">
                  <p className="mb-1">Good Parts</p>
                  <h5 className="mb-3">{partsData.good_parts}</h5>
                  <p className="text-truncate mb-0">
                    <span className={per_good_parts_ago < 0 ? "text-danger me-2" : "text-success me-2"}>
                      {per_good_parts_ago}%
                      <i className={per_good_parts_ago < 0 ? "ri-arrow-right-down-line align-bottom ms-1" : "ri-arrow-right-up-line align-bottom ms-1"}></i>
                    </span>
                    From previous
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xl={3} sm={6}>
          <Card>
            <CardBody>
              <div className="d-flex text-muted">
                <div className="flex-shrink-0 me-3 align-self-center">
                  <RadialChart3 bad_parts={per_bad_parts}
                    id="radialchart-3"
                    className="apex-charts"
                    dir="ltr"
                  />
                </div>

                <div className="flex-grow-1 overflow-hidden">
                  <p className="mb-1">Bad Parts</p>
                  <h5 className="mb-3">{partsData.bad_parts}</h5>
                  <p className="text-truncate mb-0">
                    <span className={per_bad_parts_ago < 0 ? "text-danger me-2" : "text-success me-2"}>
                      {per_bad_parts_ago}%
                      <i className={per_bad_parts_ago < 0 ? "ri-arrow-right-down-line align-bottom ms-1" : "ri-arrow-right-up-line align-bottom ms-1"}></i>
                    </span>
                    From previous
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xl={3} sm={6}>
          <Card>
            <CardBody>
              <div className="d-flex text-muted">
                <div className="flex-shrink-0 me-3 align-self-center">
                  <div className="avatar-sm">
                    <div className="avatar-title bg-light rounded-circle text-primary font-size-20">
                      <i className="ri-group-line"></i>
                    </div>
                  </div>
                </div>
                <div className="flex-grow-1 overflow-hidden">
                  <p className="mb-1">Total Parts Per Shift</p>
                  <h5 className="mb-3">{partsData.total_parts}</h5>
                  <p className="text-truncate mb-0">
                    <span className={per_total_parts_ago < 0 ? "text-danger me-2" : "text-success me-2"}>
                      {per_total_parts_ago}%
                      <i className={per_total_parts_ago < 0 ? "ri-arrow-right-down-line align-bottom ms-1" : "ri-arrow-right-up-line align-bottom ms-1"}></i>
                    </span>
                    From previous
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default UserPanel;
