const express = require("express");
const {
  saveUser,
  deleteAllUsers,
  getUserByName,
  getAllUser,
  getUserById,
  login,
} = require("../controllers/user");
var router = express.Router();

//get all uses

router.get("/", getAllUser);

router.post("/signup", saveUser);

router.post("/login", login);

router.get("/search", getUserByName);

router.delete("/", deleteAllUsers);

router.get("/:id", getUserById);

module.exports = router;
