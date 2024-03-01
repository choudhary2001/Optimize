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
            });

            setEditedMachine(null);
        }
        else {
            setEditedMachine(machine);
            setFormData({
                company_name: machine.company_name,
            });
        }
    }


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
            const apiUrl = editedMachine ? `http://13.235.76.12:3003/api/update/company/${editedMachine._id}` : 'http://13.235.76.12:3003/create/company';

            const formDataObject = new FormData();
            formDataObject.append('company_name', formData.company_name);
            formDataObject.append('company_logo', selectedImage);

            const response = await fetch(apiUrl, {
                method: editedMachine ? 'PATCH' : 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,

                },
                body: formDataObject,
            });

            const responseData = await response.json();

            if (response.ok) {
                setResponseMessage(responseData.message);
                setEditMode(false);
                setFormData({
                    company_name: "",
                });
                fetchCompany();

                setmodal_list_edit(false)
            } else {
                setResponseMessage(`Error: ${responseData.error}`);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };




    const [companyData, setCompanyData] = useState([]);
    const [modalEdit, setModalEdit] = useState(false);
    const [editMode, setEditMode] = useState(false);

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
                console.log(data)
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

    const handleDeleteMchine = async (userId) => {
        try {
            // Make API request to delete the user
            const response = await fetch(`http://13.235.76.12:3003/api/delete/company/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`, // Replace with your actual token
                },
            });

            if (response.ok) {
                // If the deletion was successful, refresh the user data
                fetchCompany();
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

    const filteredMachine = companyData.filter((machine) =>
        machine.company_name.toLowerCase().includes(searchTerm.toLowerCase())
    );





    const handleSaveChanges = async (userId, field, value) => {
        try {
            // Update user on the server
            const response = await fetch(`http://13.235.76.12:3003/api/update/company/${userId}`, {
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
                setCompanyData(prevData =>
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
                    <Breadcrumbs title="Tables" breadcrumbItem="Company" />

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
                                    <h4 className="card-title mb-0">Add, Edit & Remove Company</h4>
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

                                                        <th className="sort" data-sort="customer_name">Company Name</th>
                                                        <th className="sort" data-sort="logo">Company Logo</th>
                                                        <th className="sort" data-sort="action">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="list form-check-all">
                                                    {filteredMachine.map((machine, index) => (
                                                        <tr key={index}>

                                                            <td className="customer_name">{machine.company_name}</td>
                                                            <td>

                                                                {machine.company_logo && (
                                                                    <>

                                                                        <td className="logo"><img src={`http://13.235.76.12:3003/images/${machine.company_logo}`} height="48" /></td>

                                                                        {/* <img
                                                                                src={`${machine.company_logo}`}
                                                                                alt={machine.company_name}
                                                                            /> */}

                                                                    </>
                                                                )}
                                                            </td>

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
                    {editMode ? "Edit Company" : "Add Company"}
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
                            <input type="text" id="company_name" className="form-control" placeholder="Company Name" value={formData.company_name}
                                onChange={handleInputChange} required />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="company_logo-field" className="form-label">Company Logo</label>

                            <input type="file" accept='image/*' id="company_logo" className="form-control" placeholder="Company Logo" value={formData.company_logo}
                                onChange={handleInputChange} required />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <div className="hstack gap-2 justify-content-end">
                            <button type="button" className="btn btn-light" onClick={() => setmodal_list(false)}>Close</button>
                            <button type="submit" className="btn btn-success" id="add-btn" onClick={handleSubmit}> {editMode ? "Update Company" : "Add Company"}
                            </button>
                            {/* <button type="button" className="btn btn-success" id="edit-btn">Update</button> */}
                        </div>
                    </ModalFooter>
                </form>
            </Modal>

            {/* Add Modal */}
            <Modal isOpen={modal_list_edit} toggle={() => { setEditMode(true); setmodal_list_edit(false); }} centered >
                <ModalHeader className="bg-light p-3" id="exampleModalLabel1" toggle={() => { tog_list_edit(null); }}>
                    Edit Company
                </ModalHeader>

                <form className="tablelist-form">
                    <ModalBody>
                        <div className="mb-3" id="modal-id" style={{ display: "none" }}>
                            <label htmlFor="id-field" className="form-label">ID</label>
                            <input type="text" id="id-field" className="form-control" placeholder="ID" readOnly />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="company_name-field" className="form-label">Company Name</label>
                            <input type="text" id="company_name" className="form-control" placeholder="Company Name" value={formData.company_name}
                                onChange={handleInputChange} required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="company_logo-field" className="form-label">Company Name</label>

                            <input type="file" accept='image/*' id="company_logo" className="form-control" placeholder="Company Logo" value={formData.company_logo}
                                onChange={handleInputChange} required />
                        </div>

                    </ModalBody>
                    <ModalFooter>
                        <div className="hstack gap-2 justify-content-end">
                            <button type="button" className="btn btn-light" onClick={() => setmodal_list_edit(false)}>Close</button>
                            <button type="submit" className="btn btn-success" id="add-btn" onClick={handleSubmit}> Update Company
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
