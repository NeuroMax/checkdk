import { Document } from "mongoose";
import { ICheck } from "../interfaces/check.interface";

export interface CheckModel extends Document, ICheck {}