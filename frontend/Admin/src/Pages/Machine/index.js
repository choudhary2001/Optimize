import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, CardHeader, Col, Container, ListGroup, ListGroupItem, Modal, ModalBody, ModalFooter, Row, ModalHeader } from 'reactstrap';
import Breadcrumbs from "../../components/Common/Breadcrumb";
import SimpleBar from 'simplebar-react';
import { Link } from 'react-router-dom';
import List from 'list.js';
// Import Flatepicker
import Flatpickr from "react-flatpickr";
import Logout from '../Authentication/Logout';

const ListTables = () => {

    const [modal_list, setmodal_list] = useState(false);
    function tog_list() {
        setmodal_list(!modal_list);
    }
    const [editedMachine, setEditedMachine] = useState(null);

    const [modal_list_edit, setmodal_list_edit] = useState(false);
    function tog_list_edit(machine) {
        console.log(machine);
        setmodal_list_edit(!modal_list_edit);
        if (machine === null) {
            setmodal_list_edit(false);
            setFormData({
                company_name: "",
                production_time: "",
                ideal_cycle_time: "",
                scrap_number: "",
                design_capacity: "",
                topic: "",
                machine_name: ""
            });

            setEditedMachine(null);
        }
        else {
            setEditedMachine(machine);
            setFormData({
                company_name: machine.company_name,
                production_time: machine.production_time,
                ideal_cycle_time: machine.ideal_cycle_time,
                scrap_number: machine.scrap_number,
                design_capacity: machine.design_capacity,
                machine_name: machine.machine_name,
                topic: machine.topic,
            });
        }
    }

    const [companyData, setCompanyData] = useState([]);

    const fetchCompany = async () => {
        try {
            // Fetch data from your API
            const response = await fetch('http://13.235.76.12:3003/api/all/company', {
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${authToken}` // Replace with your actual token
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data);
                setCompanyData(data);
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
        fetchCompany()
    }, []);

    const [modal_delete, setmodal_delete] = useState(false);
    function tog_delete() {
        setmodal_delete(!modal_delete);
    }

    useEffect(() => {

        const attroptions = {
            valueNames: [
                'name',
                'born',
                {
                    data: ['id']
                },
                {
                    attr: 'src',
                    name: 'image'
                },
                {
                    attr: 'href',
                    name: 'link'
                },
                {
                    attr: 'data-timestamp',
                    name: 'timestamp'
                }
            ]
        };
        const attrList = new List('users', attroptions);

        // Existing List
        const existOptionsList = {
            valueNames: ['contact-name', 'contact-message']
        };

        new List('contact-existing-list', existOptionsList);

        // Fuzzy Search list
        new List('fuzzysearch-list', {
            valueNames: ['name']
        });

        // pagination list

        new List('pagination-list', {
            valueNames: ['pagi-list'],
            page: 3,
            pagination: true
        });
    });


    const [formData, setFormData] = useState({
        company_name: "",
        production_time: "",
        ideal_cycle_time: "",
        scrap_number: "",
        design_capacity: "",
        topic: "",
        machine_name: "",
    });

    const [responseMessage, setResponseMessage] = useState("");
    const [modalList, setModalList] = useState(false);

    const [selectedImage, setSelectedImage] = useState(null);

    const handleInputChange = (e) => {
        if (e.target.type === 'file') {
            setSelectedImage(e.target.files[0]);
        } else {
            setFormData({ ...formData, [e.target.id]: e.target.value });
        }
    };


    const authToken = JSON.parse(localStorage.getItem("authUser")).token;

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const apiUrl = editedMachine ? `http://13.235.76.12:3003/api/update/machine/${editedMachine._id}` : 'http://13.235.76.12:3003/create/machine';

            const formDataObject = new FormData();
            formDataObject.append('company_name', formData.company_name);
            formDataObject.append('production_time', formData.production_time);
            formDataObject.append('ideal_cycle_time', formData.ideal_cycle_time);
            formDataObject.append('scrap_number', formData.scrap_number);
            formDataObject.append('design_capacity', formData.design_capacity);
            formDataObject.append('topic', formData.topic);
            formDataObject.append('machine_name', formData.machine_name);
            formDataObject.append('logo', selectedImage);

            const response = await fetch(apiUrl, {
                method: editedMachine ? 'PATCH' : 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                body: formDataObject,
            });

            const responseData = await response.json();

            if (response.ok) {
                setResponseMessage(responseData.message);
                setEditMode(false);
                setFormData({
                    company_name: "",
                    production_time: "",
                    ideal_cycle_time: "",
                    scrap_number: "",
                    design_capacity: "",
                    topic: "",
                    machine_name: ""
                });
                fetchMachine();

                setmodal_list_edit(false);
            } else {
                setResponseMessage(`Error: ${responseData.error}`);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };



    const [machineData, setMachineData] = useState([]);
    const [modalEdit, setModalEdit] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const fetchMachine = async () => {
        try {
            // Fetch data from your API
            const response = await fetch('http://13.235.76.12:3003/api/all/machine', {
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${authToken}` // Replace with your actual token
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data)
                setMachineData(data);
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
        fetchMachine()
    }, []);

    const handleDeleteMchine = async (userId) => {
        try {
            // Make API request to delete the user
            const response = await fetch(`http://13.235.76.12:3003/api/delete/machine/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`, // Replace with your actual token
                },
            });

            if (response.ok) {
                // If the deletion was successful, refresh the user data
                fetchMachine();
            } else if (response.status === 401) {
                // Unauthorized: Log out the user
                localStorage.removeItem("authUser");
                localStorage.removeItem("admin");
            } else {
                console.error('Error fetching data:', response.statusText);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const [searchTerm, setSearchTerm] = useState("");

    const handleSearchTermChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredMachine = machineData.filter((machine) =>
        // machine.company_name.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.machine_name.toLowerCase().includes(searchTerm.toLowerCase())
    );





    const handleSaveChanges = async (userId, field, value) => {
        try {
            // Update user on the server
            const response = await fetch(`http://13.235.76.12:3003/api/update/machine/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}` // Replace with your actual token
                },
                body: JSON.stringify({ [field]: value }),
            });

            const responseData = await response.json();

            if (response.ok) {
                // Update the local state with the new user data
                setMachineData(prevData =>
                    prevData.map(user =>
                        user._id === userId ? { ...user, [field]: value } : user
                    )
                );

                // Reset editedMachine state
                setEditedMachine(null);
            } else if (response.status === 401) {
                // Unauthorized: Log out the user
                localStorage.removeItem("authUser");
                localStorage.removeItem("admin");
            } else {
                console.error('Error fetching data:', response.statusText);
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };


    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Tables" breadcrumbItem="Machine" />

                    <Row>
                        {responseMessage && (
                            <div className={`alert ${responseMessage.includes("Error") ? "alert-danger" : "alert-success"
                                }`}>
                                {responseMessage}
                            </div>
                        )}
                        <Col lg={12}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Add, Edit & Remove Machine</h4>
                                </CardHeader>

                                <CardBody>
                                    <div id="customerList">
                                        <Row className="g-4 mb-3">
                                            <Col className="col-sm-auto">
                                                <div className="d-flex gap-1">
                                                    <Button color="success" className="add-btn" onClick={() => tog_list()} id="create-btn"><i className="ri-add-line align-bottom me-1"></i> Add</Button>
                                                    {/* <Button color="soft-danger"
                                                    // onClick="deleteMultiple()"
                                                    ><i className="ri-delete-bin-2-line"></i></Button> */}
                                                </div>
                                            </Col>
                                            <Col className="col-sm">
                                                <div className="d-flex justify-content-sm-end">
                                                    <div className="search-box ms-2">
                                                        <input type="text" className="form-control search" placeholder="Search..." value={searchTerm}
                                                            onChange={handleSearchTermChange} />
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>

                                        <div className="table-responsive table-card mt-3 mb-1">
                                            <table className="table align-middle table-nowrap" id="customerTable">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Logo</th>
                                                        <th className="sort" data-sort="customer_name">Company Name</th>
                                                        <th className="sort" data-sort="email">Machine Name</th>
                                                        <th className="sort" data-sort="email">Topic</th>
                                                        <th className="sort" data-sort="phone">Production Time</th>
                                                        <th className="sort" data-sort="phone">Ideal Cycle Time</th>
                                                        <th className="sort" data-sort="phone">Scrap Number</th>
                                                        <th className="sort" data-sort="date">Design Capacity</th>
                                                        <th className="sort" data-sort="action">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="list form-check-all">
                                                    {filteredMachine.map((machine, index) => (
                                                        <tr key={index}>
                                                            <td>
                                                                {machine.logo && (
                                                                    <>
                                                                        <td className="logo"><img src={`http://13.235.76.12:3003/images/${machine.logo}`} height="48" /></td>
                                                                        {/* <img src={`data:image/jpeg;base64,${machine.logo.toString('base64')}`} alt={machine.machine_name} /> */}
                                                                    </>
                                                                )}
                                                            </td>
                                                            <td className="customer_name">{machine.company_name.company_name}</td>
                                                            <td className="email">{machine.machine_name}</td>
                                                            <td className="email">{machine.topic}</td>
                                                            <td className="phone">{machine.production_time}</td>

                                                            <td>
                                                                {machine.ideal_cycle_time}
                                                            </td>
                                                            <td>
                                                                {machine.scrap_number}
                                                            </td>

                                                            <td className="date">{machine.design_capacity}</td>
                                                            <td>
                                                                <div className="d-flex gap-2">
                                                                    <div className="edit">

                                                                        <button className="btn btn-warning" onClick={() => tog_list_edit(machine)}>
                                                                            Edit
                                                                        </button>

                                                                    </div>
                                                                    <div className="remove">
                                                                        <button className="btn btn-sm btn-danger remove-item-btn" data-bs-toggle="modal" data-bs-target="#deleteRecordModal" onClick={() => handleDeleteMchine(machine._id)}>
                                                                            Remove
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>

                                            </table>
                                            <div className="noresult" style={{ display: "none" }}>
                                                <div className="text-center">
                                                    <lord-icon src="https://cdn.lordicon.com/msoeawqm.json" trigger="loop"
                                                        colors="primary:#121331,secondary:#08a88a" style={{ width: "75px", height: "75px" }}>
                                                    </lord-icon>
                                                    <h5 className="mt-2">Sorry! No Result Found</h5>
                                                    <p className="text-muted mb-0">We've searched more than 150+ Orders We did not find any
                                                        orders for you search.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-end">
                                            <div className="pagination-wrap hstack gap-2">
                                                <Link className="page-item pagination-prev disabled" to="#">
                                                    Previous
                                                </Link>
                                                <ul className="pagination listjs-pagination mb-0"></ul>
                                                <Link className="page-item pagination-next" to="#">
                                                    Next
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>


                </Container>
            </div>

            {/* Add Modal */}
            <Modal isOpen={modal_list} toggle={() => { setEditMode(false); setmodal_list(false); }} centered >
                <ModalHeader className="bg-light p-3" id="exampleModalLabel" toggle={() => { tog_list(); }}>
                    {editMode ? "Edit Mchine" : "Add Machine"}
                </ModalHeader>
                {responseMessage && (
                    <div className={`alert ${responseMessage.includes("Error") ? "alert-danger" : "alert-success"} `}>
                        {responseMessage}
                    </div>
                )}
                <form className="tablelist-form">
                    <ModalBody>
                        <div className="mb-3" id="modal-id" style={{ display: "none" }}>
                            <label htmlFor="id-field" className="form-label">ID</label>
                            <input type="text" id="id-field" className="form-control" placeholder="ID" readOnly />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="company_name-field" className="form-label">Company Name</label>
                            <select id="company_name" className="form-control" placeholder="Company Name" value={formData.company_name} onChange={handleInputChange} required>
                                <option key="default">Select Company</option>
                                {companyData.map((company, index) => (
                                    <>
                                        <option key={index} value={company.company_name}>{company.company_name}</option>
                                    </>
                                ))}
                            </select>

                        </div>

                        <div className="mb-3">
                            <label htmlFor="logo-field" className="form-label">Machine Name</label>

                            <input type="file" accept='images/*' id="logo" className="form-control" placeholder="Machine Name" value={formData.logo}
                                onChange={handleInputChange} required />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="machine_name-field" className="form-label">Machine Name</label>

                            <input type="text" id="machine_name" className="form-control" placeholder="Machine Name" value={formData.machine_name}
                                onChange={handleInputChange} required />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="topic-field" className="form-label">Topic</label>

                            <input type="text" id="topic" className="form-control" placeholder="Topic" value={formData.topic}
                                onChange={handleInputChange} required />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="production_time-field" className="form-label">Production Time</label>
                            <input type="number" id="production_time" className="form-control" placeholder="Production Time" value={formData.production_time}
                                onChange={handleInputChange} required />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="ideal_cycle_time-field" className="form-label">Ideal cycle TIme</label>
                            <input type="number" id="ideal_cycle_time" className="form-control" placeholder="Enter Ideal Cycle Time" value={formData.ideal_cycle_time}
                                onChange={handleInputChange} required />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="scrap_number-field" className="form-label">Scrap Number</label>
                            <input type="text" id="scrap_number" className="form-control" placeholder="Enter Scrap Number" value={formData.scrap_number}
                                onChange={handleInputChange} required />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="design_capacity-field" className="form-label">Design Capacity</label>
                            <input type="number" id="design_capacity" className="form-control" placeholder="Design Capacity" value={formData.design_capacity}
                                onChange={handleInputChange} required />
                        </div>

                    </ModalBody>
                    <ModalFooter>
                        <div className="hstack gap-2 justify-content-end">
                            <button type="button" className="btn btn-light" onClick={() => setmodal_list(false)}>Close</button>
                            <button type="submit" className="btn btn-success" id="add-btn" onClick={handleSubmit}> {editMode ? "Update Machine" : "Add Machine"}
                            </button>
                            {/* <button type="button" className="btn btn-success" id="edit-btn">Update</button> */}
                        </div>
                    </ModalFooter>
                </form>
            </Modal>

            {/* Add Modal */}
            <Modal isOpen={modal_list_edit} toggle={() => { setEditMode(true); setmodal_list_edit(false); }} centered >
                <ModalHeader className="bg-light p-3" id="exampleModalLabel1" toggle={() => { tog_list_edit(null); }}>
                    Edit Mchine
                </ModalHeader>

                <form className="tablelist-form">
                    <ModalBody>
                        <div className="mb-3" id="modal-id" style={{ display: "none" }}>
                            <label htmlFor="id-field" className="form-label">ID</label>
                            <input type="text" id="id-field" className="form-control" placeholder="ID" readOnly />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="company_name-field" className="form-label">Company Name</label>
                            <select id="company_name" className="form-control" placeholder="Company Name" value={formData.company_name._id} onChange={handleInputChange} required>
                                <option key="default">Select Company</option>
                                {companyData.map((company, index) => (
                                    <>
                                        <option key={index} value={company._id}>{company.company_name}</option>
                                    </>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="machine_name-field" className="form-label">Machine Name</label>
                            <input type="text" id="machine_name" className="form-control" placeholder="Machine Name" value={formData.machine_name}
                                onChange={handleInputChange} required />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="logo-field" className="form-label">Machine Name</label>

                            <input type="file" accept='images/*' id="logo" className="form-control" placeholder="Machine Name" value={formData.logo}
                                onChange={handleInputChange} required />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="topic-field" className="form-label">Topic</label>

                            <input type="text" id="topic" className="form-control" placeholder="Topic" value={formData.topic}
                                onChange={handleInputChange} required />
                        </div>


                        <div className="mb-3">
                            <label htmlFor="production_time-field" className="form-label">Production Time</label>
                            <input type="number" id="production_time" className="form-control" placeholder="Production Time" value={formData.production_time}
                                onChange={handleInputChange} required />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="ideal_cycle_time-field" className="form-label">Ideal cycle TIme</label>
                            <input type="number" id="ideal_cycle_time" className="form-control" placeholder="Enter Ideal Cycle Time" value={formData.ideal_cycle_time}
                                onChange={handleInputChange} required />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="scrap_number-field" className="form-label">Scrap Number</label>
                            <input type="text" id="scrap_number" className="form-control" placeholder="Enter Scrap Number" value={formData.scrap_number}
                                onChange={handleInputChange} required />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="design_capacity-field" className="form-label">Design Capacity</label>
                            <input type="number" id="design_capacity" className="form-control" placeholder="Design Capacity" value={formData.design_capacity}
                                onChange={handleInputChange} required />
                        </div>

                    </ModalBody>
                    <ModalFooter>
                        <div className="hstack gap-2 justify-content-end">
                            <button type="button" className="btn btn-light" onClick={() => setmodal_list_edit(false)}>Close</button>
                            <button type="submit" className="btn btn-success" id="add-btn" onClick={handleSubmit}> Update Machine
                            </button>
                            {/* <button type="button" className="btn btn-success" id="edit-btn">Update</button> */}
                        </div>
                    </ModalFooter>
                </form>
            </Modal>
            {/* Remove Modal */}
            <Modal isOpen={modal_delete} toggle={() => { tog_delete(); }} className="modal fade zoomIn" id="deleteRecordModal" centered >
                <div className="modal-header">
                    <Button type="button" onClick={() => setmodal_delete(false)} className="btn-close" aria-label="Close"> </Button>
                </div>
                <ModalBody>
                    <div className="mt-2 text-center">
                        <lord-icon src="https://cdn.lordicon.com/gsqxdxog.json" trigger="loop"
                            colors="primary:#f7b84b,secondary:#f06548" style={{ width: "100px", height: "100px" }}></lord-icon>
                        <div className="mt-4 pt-2 fs-15 mx-4 mx-sm-5">
                            <h4>Are you Sure ?</h4>
                            <p className="text-muted mx-4 mb-0">Are you Sure You want to Remove this Record ?</p>
                        </div>
                    </div>
                    <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
                        <button type="button" className="btn w-sm btn-light" onClick={() => setmodal_delete(false)}>Close</button>
                        <button type="button" className="btn w-sm btn-danger " id="delete-record">Yes, Delete It!</button>
                    </div>
                </ModalBody>
            </Modal>
        </React.Fragment>
    );
};

export default ListTables;
