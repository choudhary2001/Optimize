const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema
// Define the nested modbusRTU schema
const modbusRTUSchema = new Schema({
    ts: Number,
    device_type: Number,
    txn: String,
    res: String,
    data: [Array],
    datalen: Number
});

// Define the main schema
const dataSchema = new Schema({
    topic: String,
    ts: Number,
    datetime: String,
    AIN: [Number],
    DIN: [Number],
    DOUT: [Number],
    modbusRTU: {
        type: Map,
        of: modbusRTUSchema
    }
});


// Create the model
const DataModel = mongoose.model('YourData', dataSchema);

// Export the model
module.exports = DataModel;
