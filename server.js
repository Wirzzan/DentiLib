require('dotenv').config();
const express = require ("express");
const dbConnection = require("./config/dbConfig");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes")
const actRoutes = require("./routes/actRoutes")
const dentistRoutes = require('./routes/dentistRoutes');


const app = express();
const port = 3000;


app.use(express.json());
dbConnection();

const path = require("path");
app.use(express.static(path.join(__dirname, "public")));


app.use('/dentiste', dentistRoutes);
app.use("/api", authRoutes);
app.use("/admin", adminRoutes);
app.use("/act", actRoutes);


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/login.html"));
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    method: req.method,
    path: req.originalUrl
  });
});