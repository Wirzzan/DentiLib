require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { connectSequelize } = require("./config/sequelize");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes")
const actRoutes = require("./routes/actRoutes")
const dentistRoutes = require('./routes/dentistRoutes');
const prothesistRoutes = require("./routes/prothesistRoutes");

const app = express();
const port = Number(process.env.PORT) || 3000;


app.use(express.json());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);


const path = require("path");
app.use(express.static(path.join(__dirname, "public")));



app.use("/api", authRoutes);
app.use("/admin", adminRoutes);
app.use("/act", actRoutes);
app.use('/dentiste', dentistRoutes);
app.use("/prothesiste", prothesistRoutes);


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/login.html"));
});



app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    method: req.method,
    path: req.originalUrl
  });
});

async function startServer() {
  try {
    // Attendre MySQL avant d’accepter les requêtes HTTP.
    await connectSequelize();

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch {
    console.error("Démarrage annulé : MySQL est inaccessible ou son initialisation a échoué.");
    // Signaler un échec de démarrage à Render ou au terminal.
    process.exit(1);
  }
}

startServer();
