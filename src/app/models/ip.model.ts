import { Document } from "mongoose";
import { IIp } from "../interfaces/ip.interface";

export interface IpModel extends Document, IIp {}