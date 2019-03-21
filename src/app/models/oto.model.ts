import { Document } from "mongoose";
import { IOto } from "../interfaces/oto.interface";

export interface OtoModel extends Document, IOto {}