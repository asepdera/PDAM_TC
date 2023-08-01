const mongoose = require('mongoose');
const user = require('./user');
const {Schema} = mongoose;

const materi = require('./materi');
const peserta = require('./pesertaKelas');
const instruktur  = require('./instruktur');
const jadwal = require('./jadwal');
const pesertaKelasSchema = require('./pesertaKelas');


const kelasSchema = new Schema({
  kodeKelas: { type: String, required: true, unique: true },
  nama: { type: String, required: true },
  harga: { type: Number, required: false },
  kapasitasPeserta: { type: Number, required: true },
  description: { type: String, required: true },
  methods: { type: String, required: true }, //online,offline, onlineMeeting
  materi: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Materi' }], // referensi ke schema materi
  peserta: [{type:pesertaKelasSchema,required:false}], // referensi ke schema user dengan role 3 atau peserta hanya untuk
  instruktur: [instruktur], // referensi ke schema user dengan role 2 atau instruktur
  kodeNotaDinas: { type: String, required: false }, // referensi ke schema
  classPermission: { type: String, required: false },
  kelasType: { type: Number, required: false ,default:1}, // 1 = internal pdam dan 0 = eksternal pdam atau All
  jadwal : [jadwal],
  link:{type:String,required:false},
  kategori:{type:String,required:false},
  kelasStatus : {type: Number, required: true, default : 0},// 1 = pending 2 = declined 3 = approved
  // jamMulai: { type: Date, required: true },
  // jamSelesai: { type: Date, required: true },
  // tanggal: [{ type: Date, required: true }]
  // calonPeserta : [{type: mongoose.Schema.Types.ObjectId, ref: 'calonPeserta'}],
},{ timestamps: true });

module.exports = mongoose.model('Kelas', kelasSchema);
 
//compare this snippet from models/kelas.js:
