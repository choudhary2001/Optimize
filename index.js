const express = require('express');
const app = express();
const mqtt = require('mqtt');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
app.use(cors());
app.use(bodyParser.json());
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const _dirname = path.dirname("");

const buildpath = path.join(_dirname, "./frontend/Admin/build")
app.use(express.static(buildpath));


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Specify the directory where you want to save the uploaded files
        cb(null, 'images/');
    },
    filename: function (req, file, cb) {
        // Ensure unique file names to prevent overwriting
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    }
});




const upload = multer({ storage: storage });

const DataModel = require('./DataModel');
// Connect to MongoDB

const url = 'mongodb://Optimize:Optimize!~257545@localhost:27017/optimize';

// mongoose.connect('localhost:27017/machine', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// });

mongoose.connect('mongodb://127.0.0.1:27017/machine', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Check if the connection is successful
mongoose.connection.on('connected', () => {
    //console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});


// Create a Mongoose model with a password field
const UserSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    phone: String,
    company_name: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        default: null,
    },
    machine_name: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine',
        default: null,
    },
    password: String,
    created_at: {
        type: Date,
        default: Date.now,
    },
});

// Hash the password before saving it to the database
// UserSchema.pre('save', async function (next) {
//     try {
//         const saltRounds = 10;
//         const hashedPassword = await bcrypt.hash(this.password, saltRounds);
//         this.password = hashedPassword;
//         next();
//     } catch (error) {
//         next(error);
//     }
// });

const User = mongoose.model('User', UserSchema);

const CompanySchema = new mongoose.Schema({
    company_name: String,
    company_logo: String,
    created_at: {
        type: Date,
        default: Date.now,
    },
});


const Company = mongoose.model('Company', CompanySchema);



const MachineSchema = new mongoose.Schema({
    company_name: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        default: null,
    },
    logo: String,
    machine_name: String,
    production_time: Number,
    ideal_cycle_time: Number,
    scrap_number: Number,
    design_capacity: Number,
    topic: String,
    created_at: {
        type: Date,
        default: Date.now,
    },
});


const Machine = mongoose.model('Machine', MachineSchema);


// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, 'images')))

const brokerAddress = 'mqtt://test.mosquitto.org:1883';
const options = {
    clientId: '',  // Leave blank for auto-generated
    protocolVersion: 4,  // MQTT V3.1.1
    clean: true,  // Use clean session
    keepalive: 60,
    qos: 2,
};

const client = mqtt.connect(brokerAddress, options);


// Replace with your desired MQTT topic
// const topics = ['data/ES-08:F9:E0:8F:26:04',];

let topics;

async function getUniqueTopics() {
    try {
        // Find all unique topics
        topics = await Machine.distinct('topic');
        console.log('Unique topics:', topics);
    } catch (error) {
        console.error('Error finding unique topics:', error);
    }
}

// Call the function
getUniqueTopics();

console.log(topics);

// // MQTT connection events
// client.on('connect', (connack) => {
//     if (connack.returnCode === 0) {
//         //console.log('Connected to MQTT broker!');
//         // Subscribe to the specified topic
//         client.subscribe(topic, { qos: options.qos }, (err, granted) => {
//             if (err) {
//                 console.error('Error subscribing to topic:', err);
//             } else {
//                 //console.log(`Subscribed to topic "${topic}" with QoS ${granted[0].qos}`);

//             }
//         });
//     } else {
//         console.error('Failed to connect to MQTT broker. Return code:', connack.returnCode);
//     }
// });

client.on('connect', (connack) => {
    if (connack.returnCode === 0) {
        console.log('Connected to MQTT broker!');
        if (topics) {
            // Subscribe to all specified topics
            topics.forEach((topic) => {
                client.subscribe(topic, { qos: options.qos }, (err, granted) => {
                    if (err) {
                        console.error(`Error subscribing to topic ${topic}:`, err);
                    } else {
                        // console.log(`Subscribed to topic "${topic}" with QoS ${granted[0].qos}`);
                        console.log(`Subscribed to topic "${topic}" with QoS `);
                    }
                });
            });
        }
    } else {
        console.error('Failed to connect to MQTT broker. Return code:', connack.returnCode);
    }
});


// client.on('message', (receivedTopic, message) => {
//     if (receivedTopic === topic) {
//         try {
//             // Parse the received JSON data
//             const jsonData = JSON.parse(message.toString());
//             //console.log(jsonData.modbusRTU)
//             const newData = new DataModel(jsonData);

//             // Save the document to the database
//             newData.save()
//                 .then(() => {
//                     //console.log('Data saved successfully');
//                 })
//                 .catch((error) => {
//                     console.error('Error saving data:', error);
//                 });
//             //console.log('Received JSON data:', jsonData);
//         } catch (error) {
//             console.error('Error parsing JSON data:', error.message);
//         }
//     }
// });

client.on('message', (receivedTopic, message) => {
    // Check if the received topic is one of the subscribed topics
    if (topics.includes(receivedTopic)) {
        try {
            // Parse the received JSON data
            const jsonData = JSON.parse(message.toString());
            //console.log(jsonData.modbusRTU)
            const newData = new DataModel(jsonData);
            newData.topic = receivedTopic;
            // Save the document to the database
            newData.save()
                .then(() => {
                    console.log('Data saved successfully');
                })
                .catch((error) => {
                    console.error('Error saving data:', error);
                });
        } catch (error) {
            console.error('Error parsing JSON data:', error.message);
        }
    }
});

// Handle errors
client.on('error', (error) => {
    console.error('MQTT error:', error.message);
});

// Handle disconnects
client.on('close', () => {
    //console.log('Disconnected from MQTT broker');
});

// Handle client exit
process.on('SIGINT', () => {
    client.end();
    process.exit();
});

// Express server setup
// app.get('/', (req, res) => {
//     res.send('Hello World!');
// });

const JWT_SECRET = '@#$$GFWGD&^@^#%^@^^@#FEgsghdwe62734567234';

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    // Check if the token starts with 'Bearer '
    if (!token.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized - Invalid token format' });
    }

    const tokenWithoutBearer = token.replace('Bearer ', '');

    jwt.verify(tokenWithoutBearer, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized - Invalid token' });
        }

        req.userId = decoded.userId;
        next();
    });
};

app.use('/static', express.static(path.join(__dirname, './frontend/Admin/build')));

// Wildcard route to serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './frontend/Admin/build/index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, './frontend/Admin/build/index.html'));
});

app.get('/user', (req, res) => {
    res.sendFile(path.join(__dirname, './frontend/Admin/build/index.html'));
});

app.get('/performance', (req, res) => {
    res.sendFile(path.join(__dirname, './frontend/Admin/build/index.html'));
});

app.get('/company', (req, res) => {
    res.sendFile(path.join(__dirname, './frontend/Admin/build/index.html'));
});

app.get('/machine', (req, res) => {
    res.sendFile(path.join(__dirname, './frontend/Admin/build/index.html'));
});

app.get('/Signin', (req, res) => {
    res.sendFile(path.join(__dirname, './frontend/Admin/build/index.html'));
});


//app.get('/', async(req, res) => {
//	res.sendFile(path.join(__dirname, 'path/to/your/main/file.html'));
//});

const moment = require('moment-timezone');

const timezone = 'Asia/Kolkata'; // Change this to your desired time zone

app.get('/api/machine/data', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('company_name', 'company_name') // Populate the 'company_name' field with 'company_name' property
            .populate('machine_name', 'machine_name');

        if (user && user.machine_name && user.machine_name.topic) {
            let user_topic = user.machine_name.topic;
            let totalRunningHours = 0;
            let lastStatus = 0;
            let lastStatusChangeTime;
            const currentTime = moment().tz(timezone);
            const currentHour = currentTime.hours();
            const currentDate = currentTime.format('YYYY-MM-DD');

            let timeRange;
            if (currentHour >= 6 && currentHour < 14) {
                timeRange = '6:00 - 14:00';
            } else if (currentHour >= 14 && currentHour < 22) {
                timeRange = '14:00 - 22:00';
            } else {
                timeRange = '22:00 - 6:00';
            }

            const machines = await DataModel.find({ topic: user_topic }).populate('modbusRTU');
            // //console.log(machines);

            // Filter data based on time range and current date
            const filteredData = machines.filter((machine) => {
                // Assuming `datetime` is a string in the format "YYYY-MM-DD HH:mm:ss"
                const machineDateTime = moment(machine.datetime, 'MM/DD/YYYY HH:mm:ss');

                // Extract date and hour from machine datetime
                const machineDate = machineDateTime.format('YYYY-MM-DD');
                const machineHour = machineDateTime.hour();
                // //console.log(machineDateTime, currentTime);

                if (machineDate === currentDate) {
                    // If the date matches the current date
                    if (
                        (timeRange === '6:00 - 14:00' && machineHour >= 6 && machineHour < 14) ||
                        (timeRange === '14:00 - 22:00' && machineHour >= 14 && machineHour < 22) ||
                        (timeRange === '22:00 - 6:00' && (machineHour >= 22 || machineHour < 6))
                    ) {
                        return true;
                    }
                }

                return false;
            });

            //console.log(filteredData);

            let good_parts = 0;
            let bad_parts = 0;
            let total_parts = 0;

            good_parts = (filteredData[filteredData.length - 1]?.modbusRTU?.get('1')?.data?.[0]?.[0]) ? filteredData[0]?.modbusRTU?.get('1')?.data?.[0]?.[0] : 0;
            bad_parts = (filteredData[filteredData.length - 1]?.modbusRTU?.get('1')?.data?.[1]?.[0]) ? filteredData[0]?.modbusRTU?.get('1')?.data?.[1]?.[0] : 0;
            total_parts = (filteredData[filteredData.length - 1]?.modbusRTU?.get('1')?.data?.[2]?.[0]) ? filteredData[filteredData.length - 1]?.modbusRTU?.get('1')?.data?.[2]?.[0] : 0;

            //console.log(good_parts, bad_parts, total_parts);

            for (const entry of filteredData) {
                const entryDateTime = moment(entry.datetime, 'YYYY-MM-DD HH:mm:ss');
                // //console.log(entry.DIN[0], lastStatus)
                if (entry.DIN[1] === 1 && lastStatus === 0) {
                    // Transition from off to on
                    lastStatusChangeTime = entryDateTime;
                } else if (entry.DIN[1] === 0 && lastStatus === 1) {
                    // Transition from on to off
                    totalRunningHours += entryDateTime.diff(lastStatusChangeTime, 'hours', true);
                }
                lastStatus = entry.DIN[1];
            }

            if (lastStatus === 1 && lastStatusChangeTime) {
                totalRunningHours += moment().diff(lastStatusChangeTime, 'hours', true);
            }

            //console.log(totalRunningHours);

            let totalRunningHoursAgo = 0;
            let lastStatusAgo = 0;
            let lastStatusChangeTimeAgo;

            const eightHoursAgo = currentTime.clone().subtract(8, 'hours');

            const filteredDataShiftAgo = machines.filter((machine) => {
                const machineDateTime = moment(machine.datetime, 'MM/DD/YYYY HH:mm:ss');
                const machineDate = machineDateTime.format('YYYY-MM-DD');

                // Check if the machineDateTime is within the last 8 hours
                if (machineDateTime.isSameOrAfter(eightHoursAgo) && machineDateTime.isSameOrBefore(currentTime)) {
                    return true;
                }
                return false;
            });

            let good_parts_ago = 0;
            let bad_parts_ago = 0;
            let total_parts_ago = 0;

            good_parts_ago = (filteredDataShiftAgo[filteredDataShiftAgo.length - 1]?.modbusRTU?.get('1')?.data?.[0]?.[0]) ? filteredDataShiftAgo[0]?.modbusRTU?.get('1')?.data?.[0]?.[0] : 0;
            bad_parts_ago = (filteredDataShiftAgo[filteredDataShiftAgo.length - 1]?.modbusRTU?.get('1')?.data?.[1]?.[0]) ? filteredDataShiftAgo[0]?.modbusRTU?.get('1')?.data?.[1]?.[0] : 0;
            total_parts_ago = filteredDataShiftAgo[filteredDataShiftAgo.length - 1]?.modbusRTU?.get('1')?.data?.[2]?.[0] ? filteredDataShiftAgo[filteredDataShiftAgo.length - 1]?.modbusRTU?.get('1')?.data?.[2]?.[0] : 0;

            //console.log(good_parts_ago, bad_parts_ago, total_parts_ago);

            for (const entry of filteredDataShiftAgo) {
                const entryDateTime = moment(entry.datetime, 'YYYY-MM-DD HH:mm:ss');
                //console.log(entry.DIN[0], lastStatusAgo)
                if (entry.DIN[1] === 1 && lastStatusAgo === 0) {
                    // Transition from off to on
                    lastStatusChangeTimeAgo = entryDateTime;
                } else if (entry.DIN[1] === 0 && lastStatusAgo === 1) {
                    // Transition from on to off
                    totalRunningHoursAgo += entryDateTime.diff(lastStatusChangeTimeAgo, 'hours', true);
                }
                lastStatusAgo = entry.DIN[1];
            }

            // If the last status is 'on', add the running time until now
            if (lastStatusAgo === 1 && lastStatusChangeTimeAgo) {
                totalRunningHoursAgo += moment().diff(lastStatusChangeTimeAgo, 'hours', true);
            }


            let total_parts_1st_shift = 0;
            let total_parts_2st_shift = 0;
            let total_parts_3st_shift = 0;

            if (timeRange === '6:00 - 14:00') {
                total_parts_1st_shift = total_parts_ago;
                const eight2HoursAgo = currentTime.clone().add(8, 'hours');

                const filteredData2ShiftAgo = machines.filter((machine) => {
                    const machineDateTime = moment(machine.datetime, 'MM/DD/YYYY HH:mm:ss');
                    const machineDate = machineDateTime.format('YYYY-MM-DD');
                    // Check if the machineDateTime is within the last 8 hours
                    if (machineDateTime.isSameOrAfter(eight2HoursAgo) && machineDateTime.isSameOrBefore(currentTime)) {
                        return true;
                    }
                    return false;
                });
                total_parts_2st_shift = filteredData2ShiftAgo[filteredData2ShiftAgo.length - 1]?.modbusRTU?.get('1')?.data?.[2]?.[0];

                const eight3HoursAgo = currentTime.clone().add(16, 'hours');

                const filteredData3ShiftAgo = machines.filter((machine) => {
                    const machineDateTime = moment(machine.datetime, 'MM/DD/YYYY HH:mm:ss');
                    const machineDate = machineDateTime.format('YYYY-MM-DD');

                    // Check if the machineDateTime is within the last 8 hours
                    if (machineDateTime.isSameOrAfter(eight3HoursAgo) && machineDateTime.isSameOrBefore(currentTime)) {
                        return true;
                    }
                    return false;
                });

                total_parts_3st_shift = filteredData3ShiftAgo[filteredData3ShiftAgo.length - 1]?.modbusRTU?.get('1')?.data?.[2]?.[0];
            }

            else if (timeRange === '14:00 - 22:00') {
                total_parts_2st_shift = total_parts_ago;

                const eight1HoursAgo = currentTime.clone().subtract(8, 'hours');
                const filteredData1ShiftAgo = machines.filter((machine) => {
                    const machineDateTime = moment(machine.datetime, 'MM/DD/YYYY HH:mm:ss');
                    const machineDate = machineDateTime.format('YYYY-MM-DD');

                    // Check if the machineDateTime is within the last 8 hours
                    if (machineDateTime.isSameOrAfter(eight1HoursAgo) && machineDateTime.isSameOrBefore(currentTime)) {
                        return true;
                    }
                    return false;
                });
                total_parts_1st_shift = filteredData1ShiftAgo[filteredData1ShiftAgo.length - 1]?.modbusRTU?.get('1')?.data?.[2]?.[0];

                const eight3HoursAgo = currentTime.clone().add(8, 'hours');
                const filteredData3ShiftAgo = machines.filter((machine) => {
                    const machineDateTime = moment(machine.datetime, 'MM/DD/YYYY HH:mm:ss');
                    const machineDate = machineDateTime.format('YYYY-MM-DD');

                    // Check if the machineDateTime is within the last 8 hours
                    if (machineDateTime.isSameOrAfter(eight3HoursAgo) && machineDateTime.isSameOrBefore(currentTime)) {
                        return true;
                    }
                    return false;
                });
                total_parts_3st_shift = filteredData3ShiftAgo[filteredData3ShiftAgo.length - 1]?.modbusRTU?.get('1')?.data?.[2]?.[0];

            }

            else if (timeRange === '22:00 - 6:00') {
                total_parts_3st_shift = total_parts_ago;

                const eight1HoursAgo = currentTime.clone().subtract(16, 'hours');
                const filteredData1ShiftAgo = machines.filter((machine) => {
                    const machineDateTime = moment(machine.datetime, 'MM/DD/YYYY HH:mm:ss');
                    const machineDate = machineDateTime.format('YYYY-MM-DD');

                    // Check if the machineDateTime is within the last 8 hours
                    if (machineDateTime.isSameOrAfter(eight1HoursAgo) && machineDateTime.isSameOrBefore(currentTime)) {
                        return true;
                    }
                    return false;
                });
                total_parts_1st_shift = filteredData1ShiftAgo[filteredData1ShiftAgo.length - 1]?.modbusRTU?.get('1')?.data?.[2]?.[0];


                const eight2HoursAgo = currentTime.clone().subtract(8, 'hours');
                const filteredData2ShiftAgo = machines.filter((machine) => {
                    const machineDateTime = moment(machine.datetime, 'MM/DD/YYYY HH:mm:ss');
                    const machineDate = machineDateTime.format('YYYY-MM-DD');
                    // Check if the machineDateTime is within the last 8 hours
                    if (machineDateTime.isSameOrAfter(eight2HoursAgo) && machineDateTime.isSameOrBefore(currentTime)) {
                        return true;
                    }
                    return false;
                });
                total_parts_2st_shift = filteredData2ShiftAgo[filteredData2ShiftAgo.length - 1]?.modbusRTU?.get('1')?.data?.[2]?.[0];
            }


            const planed_production_time = user.machine_name.production_time ? user.machine_name.production_time : 8;
            const ideal_cycle_time = user.machine_name.ideal_cycle_time ? user.machine_name.ideal_cycle_time : 8;
            const scrap_number = user.machine_name.scrap_number ? user.machine_name.scrap_number : 8;
            const design_capacity = user.machine_name.design_capacity ? user.machine_name.design_capacity : 8;

            let availability = 0;
            if (planed_production_time > 0) {

                availability = totalRunningHours / planed_production_time;
            }
            let performance = 0;
            if (totalRunningHours > 0) {
                performance = (ideal_cycle_time * total_parts) / totalRunningHours;
            }
            let quality = 0;
            if (total_parts > 0) {
                quality = good_parts / total_parts;
            }

            const oeee = availability * performance * quality;

            const utilization = planed_production_time / 8;
            const teep = oeee * utilization;
            let scrap_rate = 0;
            if (total_parts > 0) {
                scrap_rate = scrap_number / total_parts;
            }

            let capacity_utilization = 0;
            if (design_capacity > 0) {
                capacity_utilization = total_parts / design_capacity;
            }

            res.status(200).json({
                good_parts: good_parts,
                bad_parts: bad_parts,
                total_parts: total_parts,
                total_running_hours: totalRunningHours,
                good_parts_ago: good_parts_ago,
                bad_parts_ago: bad_parts_ago,
                total_parts_ago: total_parts_ago,
                total_running_hours_ago: totalRunningHoursAgo,
                total_parts_1st_shift: total_parts_1st_shift,
                total_parts_2st_shift: total_parts_2st_shift,
                total_parts_3st_shift: total_parts_3st_shift,
                oeee: oeee,
                teep: teep,
                scrap_rate: scrap_rate,
                capacity_utilization: capacity_utilization,
                data: filteredData
            });
        }
        else {
            res.status(404).json({ error: 'User or machine_name not found.' });
        }

    } catch (err) {
        console.error('Error finding machine:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


const exceljs = require('exceljs');

const fs = require('fs');

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


app.get('/api/data/performance/download', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('company_name', 'company_name') // Populate the 'company_name' field with 'company_name' property
            .populate('machine_name', 'machine_name');
        let user_topic = user.machine_name.topic;

        const machines = await DataModel.find({ topic: user_topic }).populate('modbusRTU');
        // //console.log(machines);

        // Filter data based on time range and current date
        const filteredData = machines.filter((machine) => {

            return true;
        });

        const lastDataEntries = filteredData.reduce((acc, machine) => {
            const machineDate = moment(machine.datetime, 'DD/MM/YYYY HH:mm:ss').format('YYYY-MM-DD');

            if (!acc[machineDate]) {
                acc[machineDate] = machine;
            }

            return acc;
        }, {});

        const lastDataList = Object.values(lastDataEntries);
        //console.log(lastDataList);

        // const user = await User.findById(req.userId).populate('company_name');
        // const user = {
        //     machine_name: {
        //         production_time: 8,
        //         ideal_cycle_time: 8,
        //         scrap_number: 9,
        //         design_capacity: 8
        //     }
        // };
        const planed_production_time = user.machine_name.production_time ? user.machine_name.production_time : 8;
        const ideal_cycle_time = user.machine_name.ideal_cycle_time ? user.machine_name.ideal_cycle_time : 8;
        const scrap_number = user.machine_name.scrap_number ? user.machine_name.scrap_number : 8;
        const design_capacity = user.machine_name.design_capacity ? user.machine_name.design_capacity : 8;



        // Define a function to calculate metrics for a given shift
        const calculateMetricsForShift = (dataList) => {
            const shiftMetrics = {
                goodPartsList: [],
                badPartsList: [],
                totalPartsList: [],
                dateTimeList: [],
                oeeeList: [],
                teepList: [],
                scraprateList: [],
                capacityUtilizationList: [],
            };

            dataList.forEach((data) => {
                const machineDateTime = moment(data.datetime, 'DD/MM/YYYY HH:mm:ss');
                const formattedDateTime = machineDateTime.format('D MMM');

                let totalRunningHours = 0;
                let lastStatus = 0;
                let lastStatusChangeTime;


                const good_parts = (data?.modbusRTU?.get('1')?.data?.[0]?.[0]) ? data.modbusRTU.get('1').data[0][0] : 0;
                const bad_parts = (data?.modbusRTU?.get('1')?.data?.[1]?.[0]) ? data.modbusRTU.get('1').data[1][0] : 0;
                const total_parts = (data?.modbusRTU?.get('1')?.data?.[2]?.[0]) ? data.modbusRTU.get('1').data[2][0] : 0;



                const entryDateTime = moment(data.datetime, 'YYYY-MM-DD HH:mm:ss');
                // //console.log(entry.DIN[0], lastStatus)
                if (data.DIN[1] === 1 && lastStatus === 0) {
                    // Transition from off to on
                    lastStatusChangeTime = entryDateTime;
                } else if (data.DIN[1] === 0 && lastStatus === 1) {
                    // Transition from on to off
                    totalRunningHours += entryDateTime.diff(lastStatusChangeTime, 'hours', true);
                }
                lastStatus = data.DIN[1];


                if (lastStatus === 1 && lastStatusChangeTime) {
                    totalRunningHours += moment().diff(lastStatusChangeTime, 'hours', true);
                }

                let availability = 0;
                let performance = 0;
                let quality = 0;
                let scrap_rate = 0;
                let capacity_utilization = 0;

                // Your existing metrics calculations...
                // ...

                if (planed_production_time > 0) {
                    availability = totalRunningHours / planed_production_time;
                }

                if (totalRunningHours > 0) {
                    performance = (ideal_cycle_time * total_parts) / totalRunningHours;
                }

                if (total_parts > 0) {
                    quality = good_parts / total_parts;
                }

                const oeee = availability * performance * quality;
                shiftMetrics.oeeeList.push(oeee);

                const utilization = planed_production_time / 8;
                const teep = oeee * utilization;
                shiftMetrics.teepList.push(teep);

                if (total_parts > 0) {
                    scrap_rate = scrap_number / total_parts;
                }

                shiftMetrics.scraprateList.push(scrap_rate);
                if (design_capacity > 0) {
                    capacity_utilization = total_parts / design_capacity;
                }


                shiftMetrics.capacityUtilizationList.push(capacity_utilization);

                shiftMetrics.goodPartsList.push(good_parts);
                shiftMetrics.badPartsList.push(bad_parts);
                shiftMetrics.totalPartsList.push(total_parts);
                shiftMetrics.dateTimeList.push(formattedDateTime);
            });

            shiftMetrics.goodPartsList.reverse();
            shiftMetrics.badPartsList.reverse();
            shiftMetrics.totalPartsList.reverse();
            shiftMetrics.dateTimeList.reverse();
            shiftMetrics.oeeeList.reverse();
            shiftMetrics.teepList.reverse();
            shiftMetrics.scraprateList.reverse();
            shiftMetrics.capacityUtilizationList.reverse();

            return shiftMetrics;
        };

        // Divide lastDataList into 3 shifts
        const shift6to14 = lastDataList.filter((data) => {
            // Check if the entry is within the shift time range
            // Adjust the time range as needed
            return moment(data.datetime, 'DD/MM/YYYY HH:mm:ss').hour() >= 6 && moment(data.datetime, 'DD/MM/YYYY HH:mm:ss').hour() < 14;
        });

        const shift14to22 = lastDataList.filter((data) => {
            // Check if the entry is within the shift time range
            // Adjust the time range as needed
            return moment(data.datetime, 'DD/MM/YYYY HH:mm:ss').hour() >= 14 && moment(data.datetime, 'DD/MM/YYYY HH:mm:ss').hour() < 22;
        });

        const shift22to6 = lastDataList.filter((data) => {
            // Check if the entry is within the shift time range
            // Adjust the time range as needed
            return moment(data.datetime, 'DD/MM/YYYY HH:mm:ss').hour() >= 22 || moment(data.datetime, 'DD/MM/YYYY HH:mm:ss').hour() < 6;
        });

        const allshift = lastDataList.filter((data) => {
            // Check if the entry is within the shift time range
            // Adjust the time range as needed
            return true;
        });

        // Calculate metrics for each shift
        const shiftMetrics6to14 = calculateMetricsForShift(shift6to14);
        const shiftMetrics14to22 = calculateMetricsForShift(shift14to22);
        const shiftMetrics22to6 = calculateMetricsForShift(shift22to6);
        const shiftMetricsallshift = calculateMetricsForShift(allshift);

        // Create an Excel workbook and worksheet
        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet('Shift Metrics');

        // Add headers to the worksheet
        worksheet.addRow(['Shift', 'DateTime', 'Good Parts', 'Bad Parts', 'Total Parts', 'OEEE', 'TEEP', 'Scrap Rate', 'Capacity Utilization']);

        // Add data to the worksheet
        const addDataToWorksheet = (shiftMetrics, shiftName) => {
            shiftMetrics.dateTimeList.forEach((dateTime, index) => {
                worksheet.addRow([
                    shiftName,
                    dateTime,
                    shiftMetrics.goodPartsList[index],
                    shiftMetrics.badPartsList[index],
                    shiftMetrics.totalPartsList[index],
                    shiftMetrics.oeeeList[index],
                    shiftMetrics.teepList[index],
                    shiftMetrics.scraprateList[index],
                    shiftMetrics.capacityUtilizationList[index],
                ]);
            });
        };

        addDataToWorksheet(shiftMetrics6to14, 'Shift 1');
        addDataToWorksheet(shiftMetrics14to22, 'Shift 2');
        addDataToWorksheet(shiftMetrics22to6, 'Shift 3');
        // addDataToWorksheet(shiftMetricsallshift, 'All Shifts');

        // Save the workbook to a file or send it as a response
        const randomInteger = getRandomInt(1, 100);
        const fileName = `shift_metrics${randomInteger}.xlsx`;
        const filePath1 = `./${fileName}`;
        await workbook.xlsx.writeFile(filePath1);
        console.log(fileName)
        // Send the Excel file as a response        
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        // res.status(200).sendFile(filePath);
        const filePath = path.join(__dirname, fileName);

        setTimeout(() => {
            fs.unlinkSync(filePath);
            console.log(`File ${fileName} deleted after 5 seconds.`);
        }, 2000);

        res.status(200).sendFile(filePath);
    } catch (error) {
        console.error('Error generating Excel file:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/api/machine/chart', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('company_name', 'company_name') // Populate the 'company_name' field with 'company_name' property
            .populate('machine_name', 'machine_name');

        if (user && user.machine_name && user.machine_name.topic) {
            let user_topic = user.machine_name.topic;

            const currentTime = moment().tz(timezone);
            const currentHour = currentTime.hours();
            const currentDate = currentTime.format('YYYY-MM-DD');

            const machines = await DataModel.find({ topic: user_topic }).populate('modbusRTU');
            // //console.log(machines);
            const filteredData = machines.filter((machine) => {
                return true; // Include all data entries
            });

            const lastDataEntries = filteredData.reduce((acc, machine) => {
                const machineDate = moment(machine.datetime, 'DD/MM/YYYY HH:mm:ss').format('YYYY-MM-DD');

                if (!acc[machineDate]) {
                    acc[machineDate] = machine;
                }

                return acc;
            }, {});

            const lastDataList = Object.values(lastDataEntries);
            //console.log(lastDataList);

            let goodPartsList = [];
            let badPartsList = [];
            let totalPartsList = [];
            let dateTimeList = [];

            lastDataList.forEach((data) => {
                const machineDateTime = moment(data.datetime, 'DD/MM/YYYY HH:mm:ss');
                const formattedDateTime = machineDateTime.format('D MMM YYYY');

                const good_parts = (data?.modbusRTU?.get('1')?.data?.[0]?.[0]) ? data.modbusRTU.get('1').data[0][0] : 0;
                const bad_parts = (data?.modbusRTU?.get('1')?.data?.[1]?.[0]) ? data.modbusRTU.get('1').data[1][0] : 0;
                const total_parts = (data?.modbusRTU?.get('1')?.data?.[2]?.[0]) ? data.modbusRTU.get('1').data[2][0] : 0;

                goodPartsList.push(good_parts);
                badPartsList.push(bad_parts);
                totalPartsList.push(total_parts);
                dateTimeList.push(formattedDateTime);
            });

            goodPartsList.reverse();
            badPartsList.reverse();
            totalPartsList.reverse();
            dateTimeList.reverse();

            //console.log("Good Parts List:", goodPartsList);
            //console.log("Bad Parts List:", badPartsList);
            //console.log("Total Parts List:", totalPartsList);
            //console.log("Datetime List:", dateTimeList);

            res.status(200).json({
                goodPartsList,
                badPartsList,
                totalPartsList,
                dateTimeList,
                data: filteredData
            });

        }
        else {
            res.status(404).json({ error: 'User or machine_name not found.' });
        }

    } catch (err) {
        console.error('Error finding machine:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// app.get('/api/machine/performance', verifyToken, async (req, res) => {
//     try {
//         const user = await User.findById(req.userId).populate('company_name');
//         const planed_production_time = user.machine_name.production_time ? user.machine_name.production_time : 8;
//         const ideal_cycle_time = user.machine_name.ideal_cycle_time ? user.machine_name.ideal_cycle_time : 8;
//         const scrap_number = user.machine_name.scrap_number ? user.machine_name.scrap_number : 8;
//         const design_capacity = user.machine_name.design_capacity ? user.machine_name.design_capacity : 8;

//         let totalRunningHours = 0;
//         let lastStatus = 0;
//         let lastStatusChangeTime;

//         let totalRunningHours1Shift = 0;
//         let lastStatus1Shift = 0;
//         let lastStatusChangeTime1Shift;

//         let totalRunningHours2Shift = 0;
//         let lastStatus2Shift = 0;
//         let lastStatusChangeTime2Shift;

//         let totalRunningHours3Shift = 0;
//         let lastStatus3Shift = 0;
//         let lastStatusChangeTime3Shift;


//         let goodPartsList1shift = [];
//         let badPartsList1shift = [];
//         let totalPartsList1shift = [];
//         let dateTimeList1shift = [];

//         let oeeeList1shift = [];
//         let teepList1shift = [];
//         let scraprateList1shift = [];
//         let capacityUtilizationList1shift = [];


//         let availability1shift = 0;
//         let performance1shift = 0;
//         let quality1shift = 0;
//         let scrap_rate1shift = 0;
//         let capacity_utilization1shift = 0;

//         let goodPartsList2shift = [];
//         let badPartsList2shift = [];
//         let totalPartsList2shift = [];
//         let dateTimeList2shift = [];

//         let oeeeList2shift = [];
//         let teepList2shift = [];
//         let scraprateList2shift = [];
//         let capacityUtilizationList2shift = [];


//         let availability2shift = 0;
//         let performance2shift = 0;
//         let quality2shift = 0;
//         let scrap_rate2shift = 0;
//         let capacity_utilization2shift = 0;

//         let goodPartsList3shift = [];
//         let badPartsList3shift = [];
//         let totalPartsList3shift = [];
//         let dateTimeList3shift = [];

//         let oeeeList3shift = [];
//         let teepList3shift = [];
//         let scraprateList3shift = [];
//         let capacityUtilizationList3shift = [];


//         let availability3shift = 0;
//         let performance3shift = 0;
//         let quality3shift = 0;
//         let scrap_rate3shift = 0;
//         let capacity_utilization3shift = 0;

//         const currentTime = moment().tz(timezone);
//         const currentHour = currentTime.hours();
//         const currentDate = currentTime.format('YYYY-MM-DD');

//         let timeRange;
//         if (currentHour >= 6 && currentHour < 14) {
//             timeRange = '6:00 - 14:00';
//         } else if (currentHour >= 14 && currentHour < 22) {
//             timeRange = '14:00 - 22:00';
//         } else {
//             timeRange = '22:00 - 6:00';
//         }

//         const machines = await DataModel.find({}).populate('modbusRTU');
//         // //console.log(machines);

//         // Filter data based on time range and current date
//         const filteredData = machines.filter((machine) => {
//             // Assuming `datetime` is a string in the format "YYYY-MM-DD HH:mm:ss"
//             const machineDateTime = moment(machine.datetime, 'MM/DD/YYYY HH:mm:ss');

//             // Extract date and hour from machine datetime
//             const machineDate = machineDateTime.format('YYYY-MM-DD');
//             const machineHour = machineDateTime.hour();
//             // //console.log(machineDateTime, currentTime);

//             // if (machineDate === currentDate) {
//             // If the date matches the current date
//             if (
//                 (timeRange === '6:00 - 14:00' && machineHour >= 6 && machineHour < 14) ||
//                 (timeRange === '14:00 - 22:00' && machineHour >= 14 && machineHour < 22) ||
//                 (timeRange === '22:00 - 6:00' && (machineHour >= 22 || machineHour < 6))
//             ) {
//                 return true;
//             }
//             // }

//             return false;
//         });

//         //console.log(filteredData);

//         let good_parts = 0;
//         let bad_parts = 0;
//         let total_parts = 0;

//         good_parts = (filteredData[filteredData.length - 1]?.modbusRTU?.get('1')?.data?.[0]?.[0]) ? filteredData[0]?.modbusRTU?.get('1')?.data?.[0]?.[0] : 0;
//         bad_parts = (filteredData[filteredData.length - 1]?.modbusRTU?.get('1')?.data?.[1]?.[0]) ? filteredData[0]?.modbusRTU?.get('1')?.data?.[1]?.[0] : 0;
//         total_parts = (filteredData[filteredData.length - 1]?.modbusRTU?.get('1')?.data?.[2]?.[0]) ? filteredData[filteredData.length - 1]?.modbusRTU?.get('1')?.data?.[2]?.[0] : 0;

//         //console.log(good_parts, bad_parts, total_parts);

//         for (const entry of filteredData) {
//             const entryDateTime = moment(entry.datetime, 'YYYY-MM-DD HH:mm:ss');
//             // //console.log(entry.DIN[0], lastStatus)
//             if (entry.DIN[0] === 1 && lastStatus === 0) {
//                 // Transition from off to on
//                 lastStatusChangeTime = entryDateTime;
//             } else if (entry.DIN[0] === 0 && lastStatus === 1) {
//                 // Transition from on to off
//                 totalRunningHours += entryDateTime.diff(lastStatusChangeTime, 'hours', true);
//             }
//             lastStatus = entry.DIN[0];
//         }

//         if (lastStatus === 1 && lastStatusChangeTime) {
//             totalRunningHours += moment().diff(lastStatusChangeTime, 'hours', true);
//         }

//         //console.log(totalRunningHours);

//         let totalRunningHoursAgo = 0;
//         let lastStatusAgo = 0;
//         let lastStatusChangeTimeAgo;

//         const eightHoursAgo = currentTime.clone().subtract(8, 'hours');

//         const filteredDataShiftAgo = machines.filter((machine) => {
//             const machineDateTime = moment(machine.datetime, 'MM/DD/YYYY HH:mm:ss');
//             const machineDate = machineDateTime.format('YYYY-MM-DD');

//             // Check if the machineDateTime is within the last 8 hours
//             if (machineDateTime.isSameOrAfter(eightHoursAgo) && machineDateTime.isSameOrBefore(currentTime)) {
//                 return true;
//             }
//             return false;
//         });

//         let good_parts_ago = 0;
//         let bad_parts_ago = 0;
//         let total_parts_ago = 0;

//         good_parts_ago = (filteredDataShiftAgo[filteredDataShiftAgo.length - 1]?.modbusRTU?.get('1')?.data?.[0]?.[0]) ? filteredDataShiftAgo[0]?.modbusRTU?.get('1')?.data?.[0]?.[0] : 0;
//         bad_parts_ago = (filteredDataShiftAgo[filteredDataShiftAgo.length - 1]?.modbusRTU?.get('1')?.data?.[1]?.[0]) ? filteredDataShiftAgo[0]?.modbusRTU?.get('1')?.data?.[1]?.[0] : 0;
//         total_parts_ago = filteredDataShiftAgo[filteredDataShiftAgo.length - 1]?.modbusRTU?.get('1')?.data?.[2]?.[0] ? filteredDataShiftAgo[filteredDataShiftAgo.length - 1]?.modbusRTU?.get('1')?.data?.[2]?.[0] : 0;

//         //console.log(good_parts_ago, bad_parts_ago, total_parts_ago);

//         for (const entry of filteredDataShiftAgo) {
//             const entryDateTime = moment(entry.datetime, 'YYYY-MM-DD HH:mm:ss');
//             //console.log(entry.DIN[0], lastStatusAgo)
//             if (entry.DIN[0] === 1 && lastStatusAgo === 0) {
//                 // Transition from off to on
//                 lastStatusChangeTimeAgo = entryDateTime;
//             } else if (entry.DIN[0] === 0 && lastStatusAgo === 1) {
//                 // Transition from on to off
//                 totalRunningHoursAgo += entryDateTime.diff(lastStatusChangeTimeAgo, 'hours', true);
//             }
//             lastStatusAgo = entry.DIN[0];
//         }

//         // If the last status is 'on', add the running time until now
//         if (lastStatusAgo === 1 && lastStatusChangeTimeAgo) {
//             totalRunningHoursAgo += moment().diff(lastStatusChangeTimeAgo, 'hours', true);
//         }


//         let good_parts_1st_shift = 0;
//         let good_parts_2st_shift = 0;
//         let good_parts_3st_shift = 0;

//         let bad_parts_1st_shift = 0;
//         let bad_parts_2st_shift = 0;
//         let bad_parts_3st_shift = 0;

//         let total_parts_1st_shift = 0;
//         let total_parts_2st_shift = 0;
//         let total_parts_3st_shift = 0;

//         let lastDataList, machineDate, machineDateTime, formattedDateTime, good_parts_shift, bad_parts_shift, total_parts_shift;

//         if (timeRange === '6:00 - 14:00') {
//             total_parts_1st_shift = total_parts_ago;
//             const eight2HoursAgo = currentTime.clone().add(8, 'hours');

//             const filteredData2ShiftAgo = machines.filter((machine) => {
//                 const machineDateTime = moment(machine.datetime, 'MM/DD/YYYY HH:mm:ss');
//                 const machineDate = machineDateTime.format('YYYY-MM-DD');
//                 // Check if the machineDateTime is within the last 8 hours
//                 if (machineDateTime.isSameOrAfter(eight2HoursAgo) && machineDateTime.isSameOrBefore(currentTime)) {
//                     return true;
//                 }
//                 return false;
//             });
//             total_parts_2st_shift = filteredData2ShiftAgo[filteredData2ShiftAgo.length - 1]?.modbusRTU?.get('1')?.data?.[2]?.[0];

//             const eight3HoursAgo = currentTime.clone().add(16, 'hours');

//             const filteredData3ShiftAgo = machines.filter((machine) => {
//                 const machineDateTime = moment(machine.datetime, 'MM/DD/YYYY HH:mm:ss');
//                 const machineDate = machineDateTime.format('YYYY-MM-DD');

//                 // Check if the machineDateTime is within the last 8 hours
//                 if (machineDateTime.isSameOrAfter(eight3HoursAgo) && machineDateTime.isSameOrBefore(currentTime)) {
//                     return true;
//                 }
//                 return false;
//             });

//             total_parts_3st_shift = filteredData3ShiftAgo[filteredData3ShiftAgo.length - 1]?.modbusRTU?.get('1')?.data?.[2]?.[0];


//             for (const entry of filteredData3ShiftAgo) {
//                 const entryDateTime = moment(entry.datetime, 'YYYY-MM-DD HH:mm:ss');
//                 //console.log(entry.DIN[0], lastStatus1Shift)
//                 if (entry.DIN[0] === 1 && lastStatus1Shift === 0) {
//                     // Transition from off to on
//                     lastStatusChangeTime1Shift = entryDateTime;
//                 } else if (entry.DIN[0] === 0 && lastStatus1Shift === 1) {
//                     // Transition from on to off
//                     totalRunningHours1Shift += entryDateTime.diff(lastStatusChangeTime1Shift, 'hours', true);
//                 }
//                 lastStatus1Shift = entry.DIN[0];
//             }

//             // If the last status is 'on', add the running time until now
//             if (lastStatus1Shift === 1 && lastStatusChangeTime1Shift) {
//                 totalRunningHours1Shift += moment().diff(lastStatusChangeTime1Shift, 'hours', true);
//             }


//             lastDataList = Object.values(filteredData3ShiftAgo);
//             //console.log(lastDataList);


//             lastDataList.forEach((data) => {
//                 machineDateTime = moment(data.datetime, 'DD/MM/YYYY HH:mm:ss');
//                 formattedDateTime = machineDateTime.format('D MMM');

//                 good_parts_shift = (data?.modbusRTU?.get('1')?.data?.[0]?.[0]) ? data.modbusRTU.get('1').data[0][0] : 0;
//                 bad_parts_shift = (data?.modbusRTU?.get('1')?.data?.[1]?.[0]) ? data.modbusRTU.get('1').data[1][0] : 0;
//                 total_parts_shift = (data?.modbusRTU?.get('1')?.data?.[2]?.[0]) ? data.modbusRTU.get('1').data[2][0] : 0;

//                 if (planed_production_time > 0) {
//                     availability = totalRunningHours1Shift / planed_production_time;
//                 }

//                 if (totalRunningHours1Shift > 0) {
//                     performance = (ideal_cycle_time * total_parts_3st_shift) / totalRunningHours1Shift;
//                 }

//                 if (total_parts > 0) {
//                     quality = good_parts / total_parts;
//                 }

//                 const oeoeeeList1shiftee = availability * performance * quality;
//                 oeeeList1shift.push(oeee);

//                 const utilization = planed_production_time / 8;
//                 const teep = oeee * utilization;
//                 teepList1shift.push(teep);

//                 if (total_parts > 0) {
//                     scrap_rate = scrap_number / total_parts;
//                 }
//                 scraprateList1shift.push(scrap_rate);

//                 if (design_capacity > 0) {
//                     capacity_utilization = total_parts / design_capacity;
//                 }
//                 capacityUtilizationList1shift.push(capacity_utilization);

//                 goodPartsList1shift.push(good_parts_shift);
//                 badPartsList1shift.push(bad_parts_shift);
//                 totalPartsList1shift.push(total_parts_shift);
//                 dateTimeList1shift.push(formattedDateTime);
//             });
//         }

//         else if (timeRange === '14:00 - 22:00') {
//             total_parts_2st_shift = total_parts_ago;

//             const eight1HoursAgo = currentTime.clone().subtract(8, 'hours');
//             const filteredData1ShiftAgo = machines.filter((machine) => {
//                 const machineDateTime = moment(machine.datetime, 'MM/DD/YYYY HH:mm:ss');
//                 const machineDate = machineDateTime.format('YYYY-MM-DD');

//                 // Check if the machineDateTime is within the last 8 hours
//                 if (machineDateTime.isSameOrAfter(eight1HoursAgo) && machineDateTime.isSameOrBefore(currentTime)) {
//                     return true;
//                 }
//                 return false;
//             });
//             total_parts_1st_shift = filteredData1ShiftAgo[filteredData1ShiftAgo.length - 1]?.modbusRTU?.get('1')?.data?.[2]?.[0];

//             const eight3HoursAgo = currentTime.clone().add(8, 'hours');
//             const filteredData3ShiftAgo = machines.filter((machine) => {
//                 const machineDateTime = moment(machine.datetime, 'MM/DD/YYYY HH:mm:ss');
//                 const machineDate = machineDateTime.format('YYYY-MM-DD');

//                 // Check if the machineDateTime is within the last 8 hours
//                 if (machineDateTime.isSameOrAfter(eight3HoursAgo) && machineDateTime.isSameOrBefore(currentTime)) {
//                     return true;
//                 }
//                 return false;
//             });
//             total_parts_3st_shift = filteredData3ShiftAgo[filteredData3ShiftAgo.length - 1]?.modbusRTU?.get('1')?.data?.[2]?.[0];

//         }

//         else if (timeRange === '22:00 - 6:00') {
//             total_parts_3st_shift = total_parts_ago;

//             const eight1HoursAgo = currentTime.clone().subtract(16, 'hours');
//             const filteredData1ShiftAgo = machines.filter((machine) => {
//                 const machineDateTime = moment(machine.datetime, 'MM/DD/YYYY HH:mm:ss');
//                 const machineDate = machineDateTime.format('YYYY-MM-DD');

//                 // Check if the machineDateTime is within the last 8 hours
//                 if (machineDateTime.isSameOrAfter(eight1HoursAgo) && machineDateTime.isSameOrBefore(currentTime)) {
//                     return true;
//                 }
//                 return false;
//             });
//             total_parts_1st_shift = filteredData1ShiftAgo[filteredData1ShiftAgo.length - 1]?.modbusRTU?.get('1')?.data?.[2]?.[0];


//             const eight2HoursAgo = currentTime.clone().subtract(8, 'hours');
//             const filteredData2ShiftAgo = machines.filter((machine) => {
//                 const machineDateTime = moment(machine.datetime, 'MM/DD/YYYY HH:mm:ss');
//                 const machineDate = machineDateTime.format('YYYY-MM-DD');
//                 // Check if the machineDateTime is within the last 8 hours
//                 if (machineDateTime.isSameOrAfter(eight2HoursAgo) && machineDateTime.isSameOrBefore(currentTime)) {
//                     return true;
//                 }
//                 return false;
//             });
//             total_parts_2st_shift = filteredData2ShiftAgo[filteredData2ShiftAgo.length - 1]?.modbusRTU?.get('1')?.data?.[2]?.[0];
//         }




//         const lastDataEntries = filteredData.reduce((acc, machine) => {
//             const machineDate = moment(machine.datetime, 'DD/MM/YYYY HH:mm:ss').format('YYYY-MM-DD');

//             if (!acc[machineDate]) {
//                 acc[machineDate] = machine;
//             }

//             return acc;
//         }, {});

//         lastDataList = Object.values(lastDataEntries);
//         //console.log(lastDataList);


//         lastDataList.forEach((data) => {
//             const machineDateTime = moment(data.datetime, 'DD/MM/YYYY HH:mm:ss');
//             const formattedDateTime = machineDateTime.format('D MMM');

//             const good_parts = (data?.modbusRTU?.get('1')?.data?.[0]?.[0]) ? data.modbusRTU.get('1').data[0][0] : 0;
//             const bad_parts = (data?.modbusRTU?.get('1')?.data?.[1]?.[0]) ? data.modbusRTU.get('1').data[1][0] : 0;
//             const total_parts = (data?.modbusRTU?.get('1')?.data?.[2]?.[0]) ? data.modbusRTU.get('1').data[2][0] : 0;



//             if (planed_production_time > 0) {
//                 availability = totalRunningHours / planed_production_time;
//             }

//             if (totalRunningHours > 0) {
//                 performance = (ideal_cycle_time * total_parts) / totalRunningHours;
//             }

//             if (total_parts > 0) {
//                 quality = good_parts / total_parts;
//             }

//             const oeee = availability * performance * quality;
//             oeeeList.push(oeee);

//             const utilization = planed_production_time / 8;
//             const teep = oeee * utilization;
//             teepList.push(teep);

//             if (total_parts > 0) {
//                 scrap_rate = scrap_number / total_parts;
//             }
//             scraprateList.push(scrap_rate);

//             if (design_capacity > 0) {
//                 capacity_utilization = total_parts / design_capacity;
//             }
//             capacityUtilizationList.push(capacity_utilization);

//             goodPartsList.push(good_parts);
//             badPartsList.push(bad_parts);
//             totalPartsList.push(total_parts);
//             dateTimeList.push(formattedDateTime);
//         });

//         goodPartsList.reverse();
//         badPartsList.reverse();
//         totalPartsList.reverse();
//         dateTimeList.reverse();



//         if (planed_production_time > 0) {

//             availability = totalRunningHours / planed_production_time;
//         }

//         if (totalRunningHours > 0) {
//             performance = (ideal_cycle_time * total_parts) / totalRunningHours;
//         }

//         if (total_parts > 0) {
//             quality = good_parts / total_parts;
//         }

//         const oeee = availability * performance * quality;

//         const utilization = planed_production_time / 8;
//         const teep = oeee * utilization;

//         if (total_parts > 0) {
//             scrap_rate = scrap_number / total_parts;
//         }

//         if (design_capacity > 0) {
//             capacity_utilization = total_parts / design_capacity;
//         }

//         res.status(200).json({
//             good_parts: good_parts,
//             bad_parts: bad_parts,
//             total_parts: total_parts,
//             total_running_hours: totalRunningHours,
//             good_parts_ago: good_parts_ago,
//             bad_parts_ago: bad_parts_ago,
//             total_parts_ago: total_parts_ago,
//             total_running_hours_ago: totalRunningHoursAgo,
//             total_parts_1st_shift: total_parts_1st_shift,
//             total_parts_2st_shift: total_parts_2st_shift,
//             total_parts_3st_shift: total_parts_3st_shift,
//             oeee: oeee,
//             teep: teep,
//             scrap_rate: scrap_rate,
//             capacity_utilization: capacity_utilization,
//             data: filteredData
//         });

//     } catch (err) {
//         console.error('Error finding machine:', err);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });




app.get('/api/data/performance', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('company_name', 'company_name') // Populate the 'company_name' field with 'company_name' property
            .populate('machine_name', 'machine_name');
        let user_topic = user.machine_name.topic;
        const machines = await DataModel.find({ topic: user_topic }).populate('modbusRTU');
        // //console.log(machines);

        // Filter data based on time range and current date
        const filteredData = machines.filter((machine) => {

            return true;
        });

        const lastDataEntries = filteredData.reduce((acc, machine) => {
            const machineDate = moment(machine.datetime, 'DD/MM/YYYY HH:mm:ss').format('YYYY-MM-DD');

            if (!acc[machineDate]) {
                acc[machineDate] = machine;
            }

            return acc;
        }, {});

        const lastDataList = Object.values(lastDataEntries);
        //console.log(lastDataList);


        const planed_production_time = user.machine_name.production_time ? user.machine_name.production_time : 8;
        const ideal_cycle_time = user.machine_name.ideal_cycle_time ? user.machine_name.ideal_cycle_time : 8;
        const scrap_number = user.machine_name.scrap_number ? user.machine_name.scrap_number : 8;
        const design_capacity = user.machine_name.design_capacity ? user.machine_name.design_capacity : 8;



        // Define a function to calculate metrics for a given shift
        const calculateMetricsForShift = (dataList) => {
            const shiftMetrics = {
                goodPartsList: [],
                badPartsList: [],
                totalPartsList: [],
                dateTimeList: [],
                oeeeList: [],
                teepList: [],
                scraprateList: [],
                capacityUtilizationList: [],
            };

            dataList.forEach((data) => {
                const machineDateTime = moment(data.datetime, 'DD/MM/YYYY HH:mm:ss');
                const formattedDateTime = machineDateTime.format('D MMM');

                let totalRunningHours = 0;
                let lastStatus = 0;
                let lastStatusChangeTime;


                const good_parts = (data?.modbusRTU?.get('1')?.data?.[0]?.[0]) ? data.modbusRTU.get('1').data[0][0] : 0;
                const bad_parts = (data?.modbusRTU?.get('1')?.data?.[1]?.[0]) ? data.modbusRTU.get('1').data[1][0] : 0;
                const total_parts = (data?.modbusRTU?.get('1')?.data?.[2]?.[0]) ? data.modbusRTU.get('1').data[2][0] : 0;



                const entryDateTime = moment(data.datetime, 'YYYY-MM-DD HH:mm:ss');
                // //console.log(entry.DIN[0], lastStatus)
                if (data.DIN[1] === 1 && lastStatus === 0) {
                    // Transition from off to on
                    lastStatusChangeTime = entryDateTime;
                } else if (data.DIN[1] === 0 && lastStatus === 1) {
                    // Transition from on to off
                    totalRunningHours += entryDateTime.diff(lastStatusChangeTime, 'hours', true);
                }
                lastStatus = data.DIN[1];


                if (lastStatus === 1 && lastStatusChangeTime) {
                    totalRunningHours += moment().diff(lastStatusChangeTime, 'hours', true);
                }

                let availability = 0;
                let performance = 0;
                let quality = 0;
                let scrap_rate = 0;
                let capacity_utilization = 0;

                // Your existing metrics calculations...
                // ...

                if (planed_production_time > 0) {
                    availability = totalRunningHours / planed_production_time;
                }

                if (totalRunningHours > 0) {
                    performance = (ideal_cycle_time * total_parts) / totalRunningHours;
                }

                if (total_parts > 0) {
                    quality = good_parts / total_parts;
                }

                const oeee = availability * performance * quality;
                shiftMetrics.oeeeList.push(oeee);

                const utilization = planed_production_time / 8;
                const teep = oeee * utilization;
                shiftMetrics.teepList.push(teep);

                if (total_parts > 0) {
                    scrap_rate = scrap_number / total_parts;
                }

                shiftMetrics.scraprateList.push(scrap_rate);
                if (design_capacity > 0) {
                    capacity_utilization = total_parts / design_capacity;
                }


                shiftMetrics.capacityUtilizationList.push(capacity_utilization);

                shiftMetrics.goodPartsList.push(good_parts);
                shiftMetrics.badPartsList.push(bad_parts);
                shiftMetrics.totalPartsList.push(total_parts);
                shiftMetrics.dateTimeList.push(formattedDateTime);
            });

            shiftMetrics.goodPartsList.reverse();
            shiftMetrics.badPartsList.reverse();
            shiftMetrics.totalPartsList.reverse();
            shiftMetrics.dateTimeList.reverse();
            shiftMetrics.oeeeList.reverse();
            shiftMetrics.teepList.reverse();
            shiftMetrics.scraprateList.reverse();
            shiftMetrics.capacityUtilizationList.reverse();

            return shiftMetrics;
        };

        // Divide lastDataList into 3 shifts
        const shift6to14 = lastDataList.filter((data) => {
            // Check if the entry is within the shift time range
            // Adjust the time range as needed
            return moment(data.datetime, 'DD/MM/YYYY HH:mm:ss').hour() >= 6 && moment(data.datetime, 'DD/MM/YYYY HH:mm:ss').hour() < 14;
        });

        const shift14to22 = lastDataList.filter((data) => {
            // Check if the entry is within the shift time range
            // Adjust the time range as needed
            return moment(data.datetime, 'DD/MM/YYYY HH:mm:ss').hour() >= 14 && moment(data.datetime, 'DD/MM/YYYY HH:mm:ss').hour() < 22;
        });

        const shift22to6 = lastDataList.filter((data) => {
            // Check if the entry is within the shift time range
            // Adjust the time range as needed
            return moment(data.datetime, 'DD/MM/YYYY HH:mm:ss').hour() >= 22 || moment(data.datetime, 'DD/MM/YYYY HH:mm:ss').hour() < 6;
        });

        const allshift = lastDataList.filter((data) => {
            // Check if the entry is within the shift time range
            // Adjust the time range as needed
            return true;
        });

        // Calculate metrics for each shift
        const shiftMetrics6to14 = calculateMetricsForShift(shift6to14);
        const shiftMetrics14to22 = calculateMetricsForShift(shift14to22);
        const shiftMetrics22to6 = calculateMetricsForShift(shift22to6);
        const shiftMetricsallshift = calculateMetricsForShift(allshift);

        // Log or return the results as needed
        //console.log(shiftMetrics6to14);
        //console.log(shiftMetrics14to22);
        //console.log(shiftMetrics22to6);
        //console.log(shiftMetricsallshift);

        res.status(200).json({
            shiftMetrics6to14,
            shiftMetrics14to22,
            shiftMetrics22to6,
            shiftMetricsallshift
        });

    }
    catch (err) {
        //console.log(err);
    }
})

app.get('/api/all/users', verifyToken, async (req, res) => {
    try {
        //console.log(req.userId);
        const user = await User.findById(req.userId);
        if (user.email === 'admin@optimize.com') {
            // const users = await User.find({}).populate('company_name', 'machine_name');
            const users = await User.find({})
                .populate('company_name', 'company_name') // Populate the 'company_name' field with 'company_name' property
                .populate('machine_name', 'machine_name'); // Populate the 'machine_name' field with 'machine_name' property

            //console.log(users);
            res.status(200).json(users);
        }
        else {
            return res.status(401).json({ error: 'Unauthorized - Invalid token' });
        }
    } catch (err) {
        console.error('Error finding users:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.post('/create/user', verifyToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(req.userId);
        if (user.email === 'admin@optimize.com') {
            // Assuming req.body contains the user data
            //console.log(req.body);
            const { first_name, last_name, email, phone, company_name, machine_name, password } = req.body;
            // Check if the email is already registered
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already registered' });
            }

            const company = await Company.findOne({ _id: company_name });

            if (!company) {
                return res.status(404).json({ error: 'Company not found' });
            }

            const machine = await Machine.findOne({ _id: machine_name });

            if (!machine) {
                return res.status(404).json({ error: 'MAchine not found' });
            }

            // Hash the password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Create a new user instance
            const newUser = new User({
                first_name,
                last_name,
                email,
                phone,
                company_name: company._id,
                machine_name: machine._id,
                password: password,
                created_at: new Date(),
            });

            await newUser.save();

            res.status(201).json({ message: 'User created successfully' });
        }
        else {
            return res.status(401).json({ error: 'Unauthorized - Invalid token' });
        }
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Login route
app.post('/login', async (req, res) => {
    try {
        //console.log(req.body);
        const { email, password } = req.body;

        let token;
        if (email === 'admin@optimize.com' && password === 'Admin@#123') {
            const user = await User.findOne({ email });
            //  if (!user) {
            //    token = jwt.sign({ userId: "admin", admin: true }, JWT_SECRET, { expiresIn: '2d' });
            //    res.status(200).json({ message: 'Login successful', token, admin: true });
            // }
            // Include additional options in the payload object
            token = jwt.sign({ userId: user._id, admin: true }, JWT_SECRET, { expiresIn: '2d' });
            res.status(200).json({ message: 'Login successful', token, admin: true });
        } else {
            // Check if the user with the given email exists
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Compare the provided password with the hashed password in the database
            // const passwordMatch = await bcrypt.compare(password, user.password);
            if (password !== user.password) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Generate a JWT token
            token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '2d' });
            res.status(200).json({ message: 'Login successful', token });
        }

        // Send the token in the response
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.patch('/api/update/user/:userId', async (req, res) => {
    const userId = req.params.userId;
    const updateData = req.body;
    //console.log(userId, updateData)
    try {
        // Validate and update the user data in the database
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/api/delete/user/:userId', verifyToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(req.userId);
        if (user.email === 'admin@optimize.com') {
            const userId = req.params.userId;
            //console.log(userId);
            // Find the user by ID and delete
            const deletedUser = await User.findByIdAndDelete(userId);

            if (!deletedUser) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.status(200).json({ message: 'User deleted successfully' });
        }
        else {
            return res.status(401).json({ error: 'Unauthorized - Invalid token' });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/api/user/profile', verifyToken, async (req, res) => {
    try {
        // Fetch user from the database based on the decoded user ID from the token
        const user = await User.findById(req.userId).populate('company_name', 'company_logo'); // Populate the 'company_name' field with 'company_name' property


        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        //console.log(user)
        // Send user data as a response
        res.json({
            firstName: user.first_name,
            lastName: user.last_name,
            machine_name: user.machine_name,
            company_name: user.company_name
            // Add other fields as needed
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/create/machine', verifyToken, upload.single('logo'), async (req, res) => {
    try {
        // Assuming req.body contains the user data
        //console.log(req.body);
        const { company_name, production_time, ideal_cycle_time, scrap_number, design_capacity, topic, machine_name } = req.body;
        //console.log(req.userId);
        const user = await User.findById(req.userId);
        if (user.email === 'admin@optimize.com') {
            // Create a new user instance
            const company = await Company.findOne({ company_name });
            //console.log(company)
            if (!company) {
                return res.status(404).json({ error: 'Company not found' });
            }
            const newMachine = new Machine({
                company_name: company._id,
                production_time,
                topic,
                ideal_cycle_time,
                scrap_number,
                design_capacity,
                machine_name,
                logo: req.file.filename
            });

            await newMachine.save();

            res.status(201).json({ message: 'Machine created successfully' });
        }
        else {
            return res.status(401).json({ error: 'Unauthorized - Invalid token' });
        }
    } catch (error) {
        console.error('Error creating Machine:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/all/machine', verifyToken, async (req, res) => {
    try {
        //console.log(req.userId);
        const user = await User.findById(req.userId);
        if (user.email === 'admin@optimize.com') {
            const machines = await Machine.find({}).populate('company_name');


            res.status(200).json(machines);
        }
        else {
            return res.status(401).json({ error: 'Unauthorized - Invalid token' });
        }
    } catch (err) {
        console.error('Error finding machine:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/user/machine/name', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .populate('company_name', 'company_name') // Populate the 'company_name' field with 'company_name' property
            .populate('machine_name', 'machine_name topic');

        if (user && user.machine_name && user.machine_name.topic) {


            const userTopic = user.machine_name.topic;
            // Assuming the `company_name` field is a reference to another model
            const machines = await Machine.find({ company_name: user.company_name._id, topic: userTopic });

            if (!machines || machines.length === 0) {
                return res.status(404).json({ error: 'No machines found for the user\'s company and topic.' });
            }

            const machineDataDict = {};

            for (const machine of machines) {
                const lastMachineData = await DataModel.findOne({ topic: userTopic })
                    .sort({ datetime: -1 }) // Sort in descending order to get the latest data first
                    .populate('modbusRTU');
                const machine_name_data = machine.machine_name;
                const machine_name_id = machine._id;
                const machine_file = machine.logo;
                if (lastMachineData) {
                    const din1Value = lastMachineData.DIN[1];
                    machineDataDict[machine.machine_name] = {
                        machine_name_id,
                        machine_name_data,
                        din1Value,
                        machine_file
                    };
                } else {
                    // Handle the case where no data is found for the machine
                    machineDataDict[machine.machine_name] = {
                        lastMachineData: null,
                        din1Value: null,
                    };
                }
            }
            console.log(machineDataDict)
            res.status(200).json(machineDataDict);
        }
        else {
            res.status(404).json({ error: 'User or machine_name not found.' });
        }
    } catch (err) {
        console.error('Error finding machine:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Define the route to save a machine to a user
app.post('/api/user/machine/update', verifyToken, async (req, res) => {
    try {
        // Assuming the request body contains the user ID and machine ID
        const userId = req.userId;
        const { machineId } = req.body;
        console.log(userId, machineId);
        // Find the user and machine by their IDs
        const user = await User.findById(userId);
        const machine = await Machine.findById(machineId);
        console.log(user, machine)
        // Check if the user and machine exist
        if (!user || !machine) {
            return res.status(404).json({ error: 'User or machine not found.' });
        }

        // Save the machine to the user's profile
        user.machine_name = machine;
        await user.save();

        res.status(200).json({ message: 'Machine saved to user successfully.' });
    } catch (error) {
        console.error('Error saving machine to user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/api/all/machine/:id', verifyToken, async (req, res) => {
    try {
        //console.log(req.userId);
        const user = await User.findById(req.userId);
        if (user.email === 'admin@optimize.com') {
            const id = req.params.id;
            //console.log(id);
            // Assuming your Machine model has a reference to the Company model
            const machines = await Machine.find({ company_name: id })
                .populate('company_name', 'company_name');
            //console.log(machines);
            res.status(200).json(machines);
        } else {
            return res.status(401).json({ error: 'Unauthorized - Invalid token' });
        }
    } catch (err) {
        console.error('Error finding machines:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.patch('/api/update/machine/:id', verifyToken, upload.single('logo'), async (req, res) => {
    const _id = req.params.id;
    const updateData = req.body;
    const user = await User.findById(req.userId);

    if (user.email === 'admin@optimize.com') {
        try {
            // Validate update data (you might want to add more validation logic)
            if (!updateData) {
                return res.status(400).json({ error: 'Update data is required' });
            }

            // Check if the ID is a valid MongoDB ObjectId
            if (!isValidObjectId(_id)) {
                return res.status(400).json({ error: 'Invalid machine ID' });
            }

            // Build a selective update object
            const selectiveUpdate = {};
            if (updateData.production_time) selectiveUpdate.production_time = updateData.production_time;
            if (updateData.topic) selectiveUpdate.topic = updateData.topic;
            if (updateData.ideal_cycle_time) selectiveUpdate.ideal_cycle_time = updateData.ideal_cycle_time;
            if (updateData.scrap_number) selectiveUpdate.scrap_number = updateData.scrap_number;
            if (updateData.design_capacity) selectiveUpdate.design_capacity = updateData.design_capacity;
            if (updateData.machine_name) selectiveUpdate.machine_name = updateData.machine_name;
            if (req.file.filename) selectiveUpdate.logo = req.file.filename;

            // Update the machine data in the database
            const updatedMachine = await Machine.findByIdAndUpdate(_id, selectiveUpdate, { new: true });

            if (!updatedMachine) {
                return res.status(404).json({ error: 'Machine not found' });
            }

            res.json({ message: 'Machine updated successfully', machine: updatedMachine });
        } catch (error) {
            console.error('Error updating machine:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
});


app.post('/create/company', verifyToken, upload.single('company_logo'), async (req, res) => {
    try {
        // Assuming req.body contains the user data
        //console.log(req.body);
        const { company_name } = req.body;
        console.log(req.file.path)
        //console.log(req.userId);
        const user = await User.findById(req.userId);
        if (user.email === 'admin@optimize.com') {
            // Create a new user instance
            const newCompany = new Company({
                company_name,
                company_logo: req.file.filename
            });

            await newCompany.save();

            res.status(201).json({ message: 'Company created successfully' });
        }
        else {
            return res.status(401).json({ error: 'Unauthorized - Invalid token' });
        }
    } catch (error) {
        console.error('Error creating Company:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/all/company', verifyToken, async (req, res) => {
    try {
        //console.log(req.body);
        const { company_name } = req.body;
        //console.log(req.userId);
        //const user = await User.findById(req.userId);
        // if (user.email === 'admin@optimize.com') {
        const machine = await Company.find({});
        console.log(machine);

        res.status(200).json(machine);
        //}
        // else {
        //    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
        // }
    } catch (err) {
        console.error('Error finding company:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.patch('/api/update/company/:id', verifyToken, upload.single('company_logo'), async (req, res) => {
    const _id = req.params.id;
    const updateData = req.body;
    const user = await User.findById(req.userId);

    if (user.email === 'admin@optimize.com') {
        try {
            // Validate update data (you might want to add more validation logic)
            if (!updateData) {
                return res.status(400).json({ error: 'Update data is required' });
            }

            // Check if the ID is a valid MongoDB ObjectId
            if (!isValidObjectId(_id)) {
                return res.status(400).json({ error: 'Invalid company ID' });
            }

            // Build a selective update object
            const selectiveUpdate = {};
            if (updateData.company_name) selectiveUpdate.company_name = updateData.company_name;
            if (req.file.filename) selectiveUpdate.company_logo = req.file.filename;
            // Add other fields as needed

            // Validate and update the company data in the database
            const updatedCompany = await Company.findByIdAndUpdate(_id, selectiveUpdate, { new: true });

            if (!updatedCompany) {
                return res.status(404).json({ error: 'Company not found' });
            }

            res.json({ message: 'Company updated successfully' });
        } catch (error) {
            console.error('Error updating company:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
});


// Add this function to check if the provided ID is a valid MongoDB ObjectId
function isValidObjectId(id) {
    const mongoose = require('mongoose');
    return mongoose.Types.ObjectId.isValid(id);
}



app.delete('/api/delete/machine/:machineId', verifyToken, async (req, res) => {
    try {
        //console.log(req.body);
        const { company_name } = req.body;
        //console.log(req.userId);
        const user = await User.findById(req.userId);
        if (user.email === 'admin@optimize.com') {
            const machineId = req.params.machineId;
            //console.log(machineId);
            // Find the user by ID and delete
            const deletedMachine = await Machine.findByIdAndDelete(machineId);

            if (!deletedMachine) {
                return res.status(404).json({ error: 'Macine not found' });
            }

            res.status(200).json({ message: 'Machine deleted successfully' });
        }
        else {
            return res.status(401).json({ error: 'Unauthorized - Invalid token' });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/api/delete/company/:machineId', verifyToken, async (req, res) => {
    try {
        //console.log(req.body);
        const { company_name } = req.body;
        //console.log(req.userId);
        const user = await User.findById(req.userId);
        if (user.email === 'admin@optimize.com') {
            const machineId = req.params.machineId;
            //console.log(machineId);
            // Find the user by ID and delete
            const deletedMachine = await Company.findByIdAndDelete(machineId);

            if (!deletedMachine) {
                return res.status(404).json({ error: 'Macine not found' });
            }

            res.status(200).json({ message: 'Machine deleted successfully' });
        }
        else {
            return res.status(401).json({ error: 'Unauthorized - Invalid token' });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Start the Express server on port 3000
const port = 3003;
app.listen(port, () => {
    //console.log(`Server listening on port ${port}`);
});
