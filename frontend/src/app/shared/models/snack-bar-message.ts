import { Primitive } from "@core/types/basics.types";

export interface SnackBarMessage {
	message: string;
	dynamicMessage?: Record<string, Primitive>;
}