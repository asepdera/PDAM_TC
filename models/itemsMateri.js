const mongoose = require('mongoose');
const {Schema} = mongoose;

const itemsMateriSchema = new Schema({
    title : {type: String, required: true}, 
    description : {type: String, required: true}, 
    attachment: [{type: String, required: true}],
    tugas : [{type: mongoose.Schema.Types.ObjectId, ref: 'Tugas'}]
},{ timestamps: true })

module.exports = itemsMateriSchema;
