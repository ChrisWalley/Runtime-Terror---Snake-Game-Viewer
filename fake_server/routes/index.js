const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.send({ response: "I am alive" }).status(200);
});
module.exports = router;
