import { Request, Response, NextFunction } from "express";

const deploy_memIdMiddleWare = (req: Request, res: Response, next: NextFunction) => {
  if (req.query.memId) {
    req.memId = Number(req.query.memId);
    next();
  } else {
    next();
  }
};

export default deploy_memIdMiddleWare;
