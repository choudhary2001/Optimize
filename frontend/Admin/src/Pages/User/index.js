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
        setFormData({
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            company_name: "",
            machine_name: "",
            password: "",
        });
    }

    const [modal_list_edit, setmodal_list_edit] = useState(false);



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


    const [machineData, setMachineData] = useState([]);

    const fetchMachine = async (e) => {
        try {
            // Fetch data from your API
            const response = await fetch(`http://13.235.76.12:3003/api/all/machine/${e}`, {
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

    // useEffect(() => {
    //     fetchMachine()
    // }, []);


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
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        company_name: "",
        machine_name: "",
        password: "",
    });

    const [responseMessage, setResponseMessage] = useState("");
    const [modalList, setModalList] = useState(false);

    const handleInputChange = (e) => {

        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const authToken = JSON.parse(localStorage.getItem("authUser")).token;

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const apiUrl = editedUser ? `http://13.235.76.12:3003/api/update/user/${editedUser._id}` : 'http://13.235.76.12:3003/create/user';

            const response = await fetch(apiUrl, {
                method: editedUser ? 'PATCH' : 'POST',
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(formData),
            });

            const responseData = await response.json();

            if (response.ok) {
                setResponseMessage(responseData.message);
                setEditMode(false);
                setFormData({
                    first_name: "",
                    last_name: "",
                    email: "",
                    phone: "",
                    company_name: "",
                    machine_name: "",
                    password: "",
                });
                fetchUser();
                setmodal_list_edit(false)
            } else {
                setResponseMessage(`Error: ${responseData.error}`);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };


    const [userData, setUserData] = useState([]);
    const [modalEdit, setModalEdit] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const fetchUser = async () => {
        try {
            // Fetch data from your API
            const response = await fetch('http://13.235.76.12:3003/api/all/users', {
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${authToken}` // Replace with your actual token
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data)
                setUserData(data);
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
        fetchUser()
    }, []);

    const handleDeleteUser = async (userId) => {
        try {
            // Make API request to delete the user
            const response = await fetch(`http://13.235.76.12:3003/api/delete/user/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`, // Replace with your actual token
                },
            });

            if (response.ok) {
                // If the deletion was successful, refresh the user data
                fetchUser();
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

    const filteredUsers = userData.filter((user) =>
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [editedUser, setEditedUser] = useState(null);



    const handleSaveChanges = async (userId, field, value) => {
        try {
            // Update user on the server
            const response = await fetch(`http://13.235.76.12:3003/api/update/user/${userId}`, {
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
                setUserData(prevData =>
                    prevData.map(user =>
                        user._id === userId ? { ...user, [field]: value } : user
                    )
                );

                // Reset editedUser state
                setEditedUser(null);
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

    const handleInputChangeWrapper = (e) => {
        // Call the original handleInputChange function
        handleInputChange(e);

        // Call the additional function
        fetchMachine(e.target.value);
    };

    function tog_list_edit(user) {
        console.log(user);
        setmodal_list_edit(!modal_list_edit);
        if (user === null) {
            setmodal_list_edit(false);
            setFormData({
                first_name: "",
                last_name: "",
                email: "",
                phone: "",
                company_name: "",
                machine_name: "",
                password: "",
            });
            setEditedUser(null);
        }
        else {
            fetchMachine(user.company_name._id);
            setEditedUser(user);
            setFormData(user);
        }
    }


    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Tables" breadcrumbItem="Users" />

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
                                    <h4 className="card-title mb-0">Add, Edit & Remove User</h4>
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

                                                        <th className="sort" data-sort="customer_name">User</th>
                                                        <th className="sort" data-sort="email">Email</th>
                                                        <th className="sort" data-sort="phone">Phone</th>
                                                        <th className="sort" data-sort="phone">Company Name</th>
                                                        <th className="sort" data-sort="phone">Machine Name</th>
                                                        <th className="sort" data-sort="date">Joining Date</th>
                                                        <th className="sort" data-sort="action">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="list form-check-all">
                                                    {filteredUsers.map((user, index) => (
                                                        <tr key={index}>

                                                            <td className="customer_name">{user.first_name} {user.last_name}</td>
                                                            <td className="email">{user.email}</td>
                                                            <td className="phone">{user.phone}</td>

                                                            <td>

                                                                {user.company_name && user.company_name.company_name}
                                                            </td>
                                                            <td>
                                                                {user.machine_name && user.machine_name.machine_name}


                                                            </td>

                                                            <td className="date">{user.created_at}</td>
                                                            <td>
                                                                <div className="d-flex gap-2">
                                                                    <div className="edit">

                                                                        <button className="btn btn-warning" onClick={() => tog_list_edit(user)}>
                                                                            Edit
                                                                        </button>

                                                                    </div>
                                                                    <div className="remove">
                                                                        <button className="btn btn-sm btn-danger remove-item-btn" data-bs-toggle="modal" data-bs-target="#deleteRecordModal" onClick={() => handleDeleteUser(user._id)}>
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

                                        {/* <div className="d-flex justify-content-end">
                                            <div className="pagination-wrap hstack gap-2">
                                                <Link className="page-item pagination-prev disabled" to="#">
                                                    Previous
                                                </Link>
                                                <ul className="pagination listjs-pagination mb-0"></ul>
                                                <Link className="page-item pagination-next" to="#">
                                                    Next
                                                </Link>
                                            </div>
                                        </div> */}
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
                    {editMode ? "Edit User" : "Add User"}
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
                            <label htmlFor="firstname-field" className="form-label">First Name</label>
                            <input type="text" id="first_name" className="form-control" placeholder="First Name" value={formData.first_name}
                                onChange={handleInputChange} required />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="lastname-field" className="form-label">Last Name</label>
                            <input type="text" id="last_name" className="form-control" placeholder="Last Name" value={formData.last_name}
                                onChange={handleInputChange} required />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="email-field" className="form-label">Email</label>
                            <input type="email" id="email" className="form-control" placeholder="Enter Email" value={formData.email}
                                onChange={handleInputChange} required />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="phone-field" className="form-label">Phone</label>
                            <input type="text" id="phone" className="form-control" placeholder="Enter Phone no." value={formData.phone}
                                onChange={handleInputChange} required />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="companyname-field" className="form-label">Company Name</label>
                            <select id="company_name" className="form-control" placeholder="Company Name" value={formData.company_name._id} onChange={handleInputChangeWrapper} required>
                                <option key="default">Select Company</option>
                                {companyData.map((company, index) => (
                                    <>
                                        <option key={index} value={company._id}>{company.company_name}</option>
                                    </>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="machinename-field" className="form-label">Machine Name</label>
                            <select id="machine_name" className="form-control" placeholder="Machine Name" value={formData.machine_name._id} onChange={handleInputChange} required>
                                <option key="default">Select Company</option>
                                {machineData.map((machine, index) => (
                                    <>
                                        <option key={index} value={machine._id}>{machine.machine_name}</option>
                                    </>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="password-field" className="form-label">Password</label>
                            <input type="password" id="password" className="form-control" placeholder="Password" value={formData.password}
                                onChange={handleInputChange} required />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <div className="hstack gap-2 justify-content-end">
                            <button type="button" className="btn btn-light" onClick={() => setmodal_list(false)}>Close</button>
                            <button type="submit" className="btn btn-success" id="add-btn" onClick={handleSubmit}> {editMode ? "Update User" : "Add User"}
                            </button>
                            {/* <button type="button" className="btn btn-success" id="edit-btn">Update</button> */}
                        </div>
                    </ModalFooter>
                </form>
            </Modal>

            <Modal isOpen={modal_list_edit} toggle={() => { setEditMode(true); setmodal_list_edit(false); }} centered >
                <ModalHeader className="bg-light p-3" id="exampleModalLabel1" toggle={() => { tog_list_edit(null); }}>
                    Edit User
                </ModalHeader>

                {formData && (<>

                    <form className="tablelist-form">
                        <ModalBody>
                            <div className="mb-3" id="modal-id" style={{ display: "none" }}>
                                <label htmlFor="id-field" className="form-label">ID</label>
                                <input type="text" id="id-field" className="form-control" placeholder="ID" readOnly />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="firstname-field" className="form-label">First Name</label>
                                <input type="text" id="first_name" className="form-control" placeholder="First Name" value={formData.first_name}
                                    onChange={handleInputChange} required />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="lastname-field" className="form-label">Last Name</label>
                                <input type="text" id="last_name" className="form-control" placeholder="Last Name" value={formData.last_name}
                                    onChange={handleInputChange} required />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="email-field" className="form-label">Email</label>
                                <input type="email" id="email" className="form-control" placeholder="Enter Email" value={formData.email}
                                    onChange={handleInputChange} required />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="phone-field" className="form-label">Phone</label>
                                <input type="text" id="phone" className="form-control" placeholder="Enter Phone no." value={formData.phone}
                                    onChange={handleInputChange} required />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="companyname-field" className="form-label">Company Name</label>
                                <select id="company_name" className="form-control" placeholder="Company Name" value={formData.company_name._id} onChange={handleInputChangeWrapper} required>
                                    <option key="default">Select Company</option>
                                    {companyData.map((company, index) => (
                                        <>
                                            <option key={index} value={company._id}>{company.company_name}</option>
                                        </>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="machinename-field" className="form-label">Machine Name</label>
                                <select id="machine_name" className="form-control" placeholder="Machine Name" value={formData.machine_name._id} onChange={handleInputChange} required>
                                    <option key="default">Select Company</option>
                                    {machineData.map((machine, index) => (
                                        <>
                                            <option key={index} value={machine._id}>{machine.machine_name}</option>
                                        </>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="password-field" className="form-label">Password</label>
                                <input type="password" id="password" className="form-control" placeholder="Password" value={formData.password}
                                    onChange={handleInputChange} required />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <div className="hstack gap-2 justify-content-end">
                                <button type="button" className="btn btn-light" onClick={() => setmodal_list(false)}>Cancel</button>
                                <button type="submit" className="btn btn-success" id="add-btn" onClick={handleSubmit}> Update User
                                </button>
                                {/* <button type="button" className="btn btn-success" id="edit-btn">Update</button> */}
                            </div>
                        </ModalFooter>
                    </form>
                </>)}
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
