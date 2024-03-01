import React, { useState, useEffect } from 'react';

import { connect } from "react-redux";
import { Link } from "react-router-dom";

import LanguageDropdown from "../../components/Common/TopbarDropdown/LanguageDropdown";
import NotificationDropdown from "../../components/Common/TopbarDropdown/NotificationDropdown";

//i18n
import { withTranslation } from "react-i18next";

//import images
import logoSm from "../../assets/images/logo-sm.png";
import logoDark from "../../assets/images/logo-dark.png";
import logoLight from "../../assets/images/logo-light.png";

// Redux Store
import {
  showRightSidebarAction,
  toggleLeftmenu,
  changeSidebarType,
} from "../../store/actions";
import ProfileMenu from "../../components/Common/TopbarDropdown/ProfileMenu";
import AppsDropdown from "../../components/Common/TopbarDropdown/AppsDropdown";

const Header = (props) => {
  const [search, setsearch] = useState(false);

  function toggleFullscreen() {
    if (
      !document.fullscreenElement &&
      /* alternative standard method */ !document.mozFullScreenElement &&
      !document.webkitFullscreenElement
    ) {
      // current working methods
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen(
          Element.ALLOW_KEYBOARD_INPUT
        );
      }
    } else {
      if (document.cancelFullScreen) {
        document.cancelFullScreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
    }
  }

  function tToggle() {
    var body = document.body;
    if (window.screen.width <= 998) {
      body.classList.toggle("sidebar-enable");
    } else {
      body.classList.toggle("vertical-collpsed");
      body.classList.toggle("sidebar-enable");
    }
  }

  const authToken = JSON.parse(localStorage.getItem("authUser")).token;
  const [machines, setMachines] = useState({});
  const [selectedMachine, setSelectedMachine] = useState('');
  const [selectedCompanyLogo, setSelectedCompanyLogo] = useState('');

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
        setSelectedCompanyLogo(data.company_name.company_logo);
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
  }, []);


  const [isDownloading, setIsDownloading] = useState(false);

  const downloadFile = async (url, filename) => {
    try {
      const response = await fetch(url, {
        responseType: 'blob',
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${authToken}` // Replace with your actual token
        },
      });
      const blob = await response.blob();

      // Create a link element and trigger a click to download the file
      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = 'shift_metrics.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setIsDownloading(false);

    } catch (error) {
      console.error('Error downloading file:', error);
      // Display an error message to the user
    }
  };


  const handleDownloadClick = async () => {
    setIsDownloading(true);

    try {
      await downloadFile('http://13.235.76.12:3003/api/data/performance/download', 'report.xlsx');
    } catch (error) {
      // Handle errors appropriately
    } finally {
      setIsDownloading(false);
    }
  };


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
        console.log('Machine saved successfully.');
      } else {
        // Handle errors (optional)
        console.error('Error saving machine:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving machine:', error);
    }
  };




  return (
    <React.Fragment>
      <header id="page-topbar">
        <div className="navbar-header">
          <div className="d-flex">
            <div className="navbar-brand-box text-center" style={{ background: "white" }}>
              <Link to="/" className="logo logo-dark">
                <span className="logo-sm">
                  <img src={logoSm} alt="logo-sm-dark" height="22" />
                </span>
                <span className="logo-lg">
                  <img src={logoDark} alt="logo-dark" height="24" />
                </span>
              </Link>

              <Link to="/" className="logo logo-light">
                <span className="logo-sm">
                  <img src={logoSm} alt="logo-sm-light" height="22" />
                </span>
                <span className="logo-lg">
                  <img src={logoLight} alt="logo-light" height="72" />
                </span>
              </Link>
            </div>

            <button
              type="button"
              className="btn btn-sm px-3 font-size-24 header-item waves-effect"
              id="vertical-menu-btn"
              onClick={() => {
                tToggle();
              }}
            >
              <i className="ri-menu-2-line align-middle"></i>
            </button>

            <form className="app-search d-lg-block">
              <div className="position-relative">
                <select value={selectedMachine} onChange={handleMachineChange} style={{ padding: "5px", margin: "10px", borderRadius: "10px" }}>
                  <option value="">Select a machine</option>

                  {Object.keys(machines).map((machineName, index) => (
                    <option key={machines[machineName].machine_name_id} value={machines[machineName].machine_name_id}>
                      {machineName}
                    </option>
                  ))}


                </select>
              </div>
            </form>
          </div>

          <div className="d-flex">
            {selectedCompanyLogo && (
              <>
                <img className="btn header-item noti-icon" src={`http://13.235.76.12:3003/images/${selectedCompanyLogo}`} height="48" style={{ borderRadius: "25px" }} />
                {/* <img src={`data:image/jpeg;base64,${machine.logo.toString('base64')}`} alt={machine.machine_name} /> */}
              </>
            )}

          </div>
          <div className="d-flex">
            <div className="dropdown d-inline-block ms-2">
              {/* <button
                onClick={() => {
                  setsearch(!search);
                }}
                type="button"
                className="btn header-item noti-icon "
                id="page-header-search-dropdown"
              >
                <i className="ri-search-line" />
              </button> */}

              <button onClick={handleDownloadClick} className="btn header-item noti-icon "
                id="page-header-search-dropdown"><svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="#288500" d="m2.859 2.877l12.57-1.795a.5.5 0 0 1 .571.494v20.848a.5.5 0 0 1-.57.494L2.858 21.123a1 1 0 0 1-.859-.99V3.867a1 1 0 0 1 .859-.99M4 4.735v14.53l10 1.429V3.306zM17 19h3V5h-3V3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4zm-6.8-7l2.8 4h-2.4L9 13.714L7.4 16H5l2.8-4L5 8h2.4L9 10.286L10.6 8H13z" /></svg></button>

              <div
                className={
                  search
                    ? "dropdown-menu dropdown-menu-lg dropdown-menu-end p-0 show"
                    : "dropdown-menu dropdown-menu-lg dropdown-menu-end p-0"
                }
                aria-labelledby="page-header-search-dropdown"
              >
                <form className="p-3">
                  <div className="form-group m-0">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search ..."
                        aria-label="Recipient's username"
                      />
                      <div className="input-group-append">
                        <button className="btn btn-primary" type="submit">
                          <i className="ri-search-line" />
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

            </div>

            {/* <AppsDropdown /> */}

            {/* <div className="dropdown d-none d-lg-inline-block ms-1">
              <button
                type="button"
                onClick={() => {
                  toggleFullscreen();
                }}
                className="btn header-item noti-icon"
                data-toggle="fullscreen"
              >
                <i className="ri-fullscreen-line" />
              </button>
            </div> */}

            {/* <NotificationDropdown /> */}

            <ProfileMenu />

            <div
              className="dropdown d-inline-block"
              onClick={() => {
                props.showRightSidebarAction(!props.showRightSidebar);
              }}
            >
              <button
                type="button"
                className="btn header-item noti-icon right-bar-toggle waves-effect"
              >
                <i className="mdi mdi-cog"></i>
              </button>
            </div>
          </div>
        </div>
      </header>
    </React.Fragment>
  );
};

const mapStatetoProps = (state) => {
  const { layoutType, showRightSidebar, leftMenu, leftSideBarType } =
    state.Layout;
  return { layoutType, showRightSidebar, leftMenu, leftSideBarType };
};

export default connect(mapStatetoProps, {
  showRightSidebarAction,
  toggleLeftmenu,
  changeSidebarType,
})(withTranslation()(Header));
