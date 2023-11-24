const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Controller = require("../controllers/documentation");

const formidable = require("express-formidable");

router.get("/", auth.user, Controller.index);
router.get("/:id", auth.user, Controller.show);
router.post("/", auth.user, formidable(), Controller.store);
router.put("/:id", auth.user, formidable(), Controller.update);
router.delete("/:id", auth.user, Controller.destroy);

module.exports = router;
