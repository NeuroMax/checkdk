import { Document } from "mongoose";
import { IClient } from "../interfaces/client.interface";

export interface ClientModel extends Document, IClient {}