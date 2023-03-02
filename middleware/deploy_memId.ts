import { Request, Response, NextFunction } from "express";

const deploy_memIdMiddleWare = (req: Request, res: Response, next: NextFunction) => {
  if (req.query.memId) {
    req.memId = +req.query.memId;
  }
  next();
};

export default deploy_memIdMiddleWare;
