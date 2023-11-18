const app = require("./app");
const connectDatabase = require("./dbconfig/Database");
// Handling uncaught Exception
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`shutting down the server for handling uncaught exception`);
  });

 // configuring Server Line
if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config({
      path: "./.env",
    });
  }
 // Integrate Database with Server
connectDatabase();

  // create server under PORT Number
const server = app.listen(process.env.PORT, () => {
    console.log(
      `Hello World, Server is running on localhost:${process.env.PORT}`
    );
  });

  // unhandled promise rejection
process.on("unhandledRejection", (err) => {
    console.log(`Shutting down the server for ${err.message}`);
    console.log(`shutting down the server for unhandle promise rejection`);
  
    server.close(() => {
      process.exit(1);
    });
  });