import express from "express";
import { createProxyMiddleware, Filter, Options, RequestHandler } from "http-proxy-middleware";
import ApiController from "./controllers/ApiController";

const DEVELOPMENT = process.env.NODE_ENV === "development";

const app = express();
const PORT = process.env.PORT || 1234;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

app.use("/api", ApiController._router);

// Static content
if (DEVELOPMENT) {
  // Proxy the connection to the React development server
  app.use("/", createProxyMiddleware({ target: "http://localhost:3123", changeOrigin: true }));
}
else {
  // Serve the static files from the React build directory
  app.use(express.static(__dirname + "/public"));
}
