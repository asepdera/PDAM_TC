const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pengumpulanTugasController = require('../controllers/pengumpulanTugas');

// router.post('/create', auth.instruktur, pengumpulanTugasController.createTugas);
// router.get('/',pengumpulanTugasController.getpTugas);
// router.put('/update/:id', auth.instruktur, pengumpulanTugasController.updateTugas);
router.put('/penilaian/:id', auth.instruktur, pengumpulanTugasController.penilaian)
router.delete('/delete/:id', auth.instruktur, pengumpulanTugasController.deleteTugas);

module.exports = router;
