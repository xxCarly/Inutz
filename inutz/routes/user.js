const router = require("express").Router();
let User = require("../models/user.model");
const bcrypt = require("bcryptjs");
require("dotenv");

// router.get("/", async (req, res) => {
//   User.findById(req.body.id)
//     .select("-password")
//     .then((user) => {
//       return res.json(user);
//     })
//     .catch((err) => {
//       return res.json(err);
//     });
// });

router.get("/all", async (req, res) => {
  User.find()
    .then((user) => {
      return res.json(user);
    })
    .catch((err) => {
      return res.json(err);
    });
});

router.post("/register", async (req, res) => {
  const {
    name,
    email,
    password: plainTextPassword,
    confirmPassword,
  } = req.body;
  const password = await bcrypt.hash(plainTextPassword, 10);
  let error_handler = [];
  if (!name || typeof name !== "string") {
    error_handler.push("Invalid Name.");
  }
  if (!email || typeof email !== "string") {
    error_handler.push("Invalid Email.");
  }
  if (!plainTextPassword || typeof plainTextPassword !== "string") {
    error_handler.push("Invalid Password.");
  }
  if (plainTextPassword.length < 8) {
    error_handler.push("Password must be atleast 8 characters.");
  }
  if (plainTextPassword != confirmPassword) {
    error_handler.push("The password confirmation does not match.");
  }

  try {
    let role = "member";
    const numberOfUser = await User.find().limit(2);
    if (numberOfUser < 1) {
      role = "superadmin";
    }
    if (error_handler.length == 0) {
      const newUser = await User.create({
        name,
        email,
        password,
        role,
      });
    }
  } catch (error) {
    if (error.code === 11000) {
      error_handler.push("Email is already registered");
    } else {
      error_handler = ["Something went wrong"];
    }
  } finally {
    if (error_handler.length > 0) {
      return res.json({
        status: "error",
        message: error_handler,
      });
    }
    return res.json({
      status: "ok",
      message: ["Successfully registered. You may now Login"],
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let error_handler = [];
  try {
    const user = await User.findOne({ email }).lean();
    if (user) {
      if (await bcrypt.compare(password, user.password)) {
        const id = user._id;
        return res.json({
          status: "ok",
          message: ["User Authenticated!"],
          _id: user._id,
        });
      } else {
        error_handler.push("Wrong password or email.");
      }
    } else {
      error_handler.push("Wrong password or email.");
    }
  } catch (error) {
    // if (error.code === 11000) {
    //     error_handler.push('Email is already registered')
    // }
  } finally {
    if (error_handler.length > 0) {
      return res.json({
        status: "error",
        message: error_handler,
      });
    }
  }
  res.json({ status: "ok" });
});

router.put("/change-password", async (req, res) => {
  const { oldPassword, newPassword, confirmPassword, id, password } = req.body;
  let error_handler = [];
  if (newPassword.length < 8) {
    error_handler.push("Password must be atleast 8 characters.");
  }
  if (newPassword != confirmPassword) {
    error_handler.push("The password confirmation does not match.");
  }
  try {
    if (await bcrypt.compare(oldPassword, password)) {
      if (error_handler.length == 0) {
        let hashpassword = await bcrypt.hash(newPassword, 10);
        const user = await User.findByIdAndUpdate(id, {
          password: hashpassword,
        });
        if (user) {
          res.json({
            status: "ok",
            message: ["Password Change Successfully"],
          });
        }
      } else {
        res.json({
          status: "error2",
          message: error_handler,
        });
      }
    } else {
      res.json({
        status: "error",
        message: ["Wrong Password"],
      });
    }
  } catch (error) {
    res.json({ status: "error", message: error.message });
  }
});
//select one user
router.get("/find/:id", async (req, res) => {
  User.findById(req.params.id)
    .then((response) => {
      res.json({ status: "ok", message: response });
    })
    .catch((err) => res.status(400).json("Error" + err));
});

module.exports = router;
