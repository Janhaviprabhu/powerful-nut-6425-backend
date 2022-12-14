const express = require("express");
const db = require("./db.json");
const fs = require("fs");
const PORT = process.env.PORT || 8080;
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).send("Hello");
});

app.post("/login", (req, res) => {
  let input = req.body;
  let data = db.people.find((ele) => ele.username == input.username);
  if (data) {
    if (data.password == input.password) {
      res.status(200).send({ token: `${input.password}@${input.username}` });
    } else {
      res.send({ error: "Wrong password" });
    }
  } else {
    res.send({ error: "User Not Found" });
  }
});

app.post("/signup", (req, res) => {
  let { username, email, password } = req.body;
  let data = db.people.find((ele) => ele.email == email);

  if (data) {
    res.send({ error: "Email already registered with us" });
  } else {
    let dat1 = db.people.find((ele) => ele.username == username);
    if (dat1) {
      res.send({ error: "Please select a different username" });
    } else {
      if (password.length >= 8) {
        let obj = {
          username,
          email,
          password,
          teamName: "",
          entries: [],
          tasks: [],
        };
        db.people.push(obj);
        fs.writeFile("./db.json", JSON.stringify(db), () => {});
        res.status(201).send({ message: "Registered Successfully" });
      } else {
        res.send({ error: "Password must have 8 characters" });
      }
    }
  }
});

app.post("/data", (req, res) => {
  let token = req.body.token;
  let [pass, username] = token.split("@");
  let data = db.people.find((ele) => ele.username == username);
  res.status(200).send({ entries: data.entries, teamName: data.teamName });
});

app.post("/addEntry", (req, res) => {
  let input = req.body;
  let [pass, uname] = input.token.split("@");
  const { id, title, tags, startTime, endTime, projectName, duration } = input;
  let data = db.people.find((ele) => ele.username == uname);
  data.entries.push({
    id,
    title,
    tasks: [],
    isActive: false,
    tags,
    startTime,
    endTime,
    projectName,
    duration,
  });
  fs.writeFile("./db.json", JSON.stringify(db), () => {});
  res.send(data);
});

app.post("/addTask", (req, res) => {
  let input = req.body;
  let [pass, uname] = input.token.split("@");
  const { id, taskId, title, tags, projectName, desc, dueDate } = input;
  let data = db.people.find((ele) => ele.username == uname);
  let entry = data.entries.find((ele) => ele.id == id);
  entry.tasks.push({
    id: taskId,
    title,
    isCompleted: false,
    tags,
    projectName,
    desc,
    dueDate,
  });
  fs.writeFile("./db.json", JSON.stringify(db), () => {});
  res.send(data);
});

app.post("/entry", (req, res) => {
  let input = req.body;
  let [pass, uname] = input.token.split("@");
  const { id } = input;
  let data = db.people.find((ele) => ele.username == uname);
  let entry = data.entries.find((ele) => ele.id == id);
  entry.isActive = !entry.isActive;
  fs.writeFile("./db.json", JSON.stringify(db), () => {});
  res.send(data);
});

app.post("/task", (req, res) => {
  let input = req.body;
  let [pass, uname] = input.token.split("@");
  const { taskId, entryId } = input;
  let data = db.people.find((ele) => ele.username == uname);
  let entry = data.entries.find((ele) => ele.id == entryId);
  let task = entry.tasks.find((ele) => ele.id == taskId);
  task.isCompleted = !task.isCompleted;
  fs.writeFile("./db.json", JSON.stringify(db), () => {});
  res.send(data);
});

app.post("/deleteEntry", (req, res) => {
  let input = req.body;
  let [pass, uname] = input.token.split("@");
  const { id } = input;
  let data = db.people.find((ele) => ele.username == uname);
  data.entries = data.entries.filter((ele) => ele.id != id);
  fs.writeFile("./db.json", JSON.stringify(db), () => {});
  res.status(200).send(data);
});

app.post("/deleteTask", (req, res) => {
  let input = req.body;
  let [pass, uname] = input.token.split("@");
  const { taskId, entryId } = input;
  let data = db.people.find((ele) => ele.username == uname);
  let entry = data.entries.find((ele) => ele.id == entryId);
  entry.tasks = entry.tasks.filter((ele) => ele.id != taskId);
  fs.writeFile("./db.json", JSON.stringify(db), () => {});
  res.status(200).send(data);
});

app.listen(PORT, () => {
  console.log(`Server Started @ http://localhost:${PORT}`);
});
