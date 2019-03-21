import { Router } from "express";

export interface IRoute {
    routes (): Router
}