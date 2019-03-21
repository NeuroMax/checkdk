import { Document } from "mongoose";
import { IDk } from "../interfaces/dk.interface";

export interface DkModel extends Document, IDk {}