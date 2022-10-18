import { Router, RequestHandler } from "express";

namespace ApiController {
  export const _router = Router();

  export const index: RequestHandler = (req, res, next) => {
    res.json({
      version: process.env.npm_package_version,
    });
  };
  _router.get("/", index);

  export const hello: RequestHandler = (req, res, next) => {
    res.send("Hello World!");
  };
  _router.get("/", hello);
}

export default ApiController;