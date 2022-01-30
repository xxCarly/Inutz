const router = require("express").Router();
let Note = require("../models/note.model");

// select * note
router.get("/", async (req, res) => {
  Note.find()
    .then((response) => res.json({ status: "ok", message: response }))
    .catch((err) => res.status(400).json("Error" + err));
});

//select one note
router.get("/find/:id", async (req, res) => {
  Note.find({ user_id: req.params.id })
    .sort({ createdAt: -1 })
    .then((response) => {
      res.json({ status: "ok", message: response });
    })
    .catch((err) => res.status(400).json("Error" + err));
});

// add note
router.post("/add", async (req, res) => {
  const { user_id, title, body } = req.body;
  const newNote = await Note.create({ title, body, user_id })
    .then((data) => {
      res.json({ status: "ok", message: "Successfully Added" });
    })
    .catch((err) =>
      res.json({ status: "error", message: "Error: " + err.message })
    );
});
// delete note
router.delete("/delete/:id", async (req, res) => {
  Note.findByIdAndRemove(req.params.id)
    .then((response) => {
      if (response) {
        res.json({ status: "ok", message: "Note Deleted" });
      } else {
        res.json({ status: "error", message: "Note Not Found" });
      }
    })
    .catch((err) =>
      res.json({ status: "error", message: "Error: " + err.message })
    );
});
//update note
router.put("/update", async (req, res) => {
  const { id, title, body } = req.body;
  Note.findByIdAndUpdate(id, { title, body })
    .then((response) => {
      if (response) {
        console.log(response);
        res.json({ status: "ok", message: "Note Updated", data: response });
      } else {
        res.json({ status: "error", message: "Note not found" });
      }
    })

    .catch((err) =>
      res.json({ status: "error", message: "Error: " + err.message })
    );
});

// truncate collection note
router.delete("/truncate", async (req, res) => {
  await Note.deleteMany()
    .then(() => res.json("Note truncated"))
    .catch((err) => res.status(400).json(err.message));
});
// router.post("/sample", async (req, res) => {
//   await Note.find({
//     title: { $regex: ".*" + req.body.title + ".*", $options: "i" },
//   })
//     .then((response) => res.json(response))
//     .catch((err) => res.status(400).json(err.message));
// });
module.exports = router;
