const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Controller = require('../controllers/kelas');

router.get('/',auth.user ,Controller.getAllKelas);
router.get('/:id',auth.user ,Controller.getOneKelas);
router.post('/', auth.admin,Controller.createKelas);
router.put('/admin/:id', auth.admin,Controller.updateKelasAdminSide);
router.put('/instruktur/:id', auth.instruktur,Controller.updateKelasInstrukturSide);
router.put('/:id', auth.student,Controller.enrolKelas)
router.delete('/:id', auth.admin,Controller.deleteKelas);


module.exports = router;