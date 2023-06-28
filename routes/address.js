import { Router } from "express";
import {
  createAddress,
  deleteAddress,
  getAddress,
  // selectAddress,
} from "../controllers/address.js";
import { authenticateUser } from "../middlewares/full-auth.js";

const router = Router();

router
  .route("/")
  .post(authenticateUser, createAddress)
  .delete(authenticateUser, deleteAddress)
  // .patch(authenticateUser, selectAddress)
  .get(authenticateUser, getAddress);

export default router;
