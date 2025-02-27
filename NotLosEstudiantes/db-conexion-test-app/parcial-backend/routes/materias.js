var express = require("express");
var router = express.Router();
const materias = require("../services/materias");

/* GET parciales listing. */
router.get("/", async function (req, res, next) {
  try {
    const resp = await materias.getMultiple(req.query.page);
    res.json(resp);
  } catch (err) {
    console.error(`Error while getting materias `, err.message);
    next(err);
  }
});

module.exports = router;
