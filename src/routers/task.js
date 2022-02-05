const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const Task = require("../models/tasks");

//TASK
//create
router.post("/tasks", auth, async (req, res) => {
  const task = new Task({ ...req.body, owner: req.user._id });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

//read all task?completed=true
//GET /tasks?limit=10&skip=0
//GET /task?sortBy=createAt:desc
router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }
  try {
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send(e);
  }
});

//read by ID
router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.send(e);
  }
});

//update task by id
router.patch("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowUpdate = ["description", "completed"];
  const isValid = updates.every((item) => allowUpdate.includes(item));
  if (!isValid) {
    return res.status(400).send({ error: "invalid update" });
  }
  try {
    const updateTask = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!updateTask) {
      return res.status(404).send("update failed: wrong task's ID");
    }

    updates.forEach((update) => (updateTask[update] = req.body[update]));
    await updateTask.save();
    res.send(updateTask);
  } catch (e) {
    res.status(500).send(e);
  }
});

//delete task
router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const deleteTask = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!deleteTask) {
      return res.status(404).send();
    }
    res.send(deleteTask);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
