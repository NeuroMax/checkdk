import { Document } from "mongoose";
import { IExpert } from "../interfaces/expert.interface";

export interface ExpertModel extends Document, IExpert {}