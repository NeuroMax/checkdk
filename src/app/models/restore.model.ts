import { Document } from "mongoose";
import { IRestore } from "../interfaces/restore.interface";

export interface RestoreModel extends Document, IRestore {}