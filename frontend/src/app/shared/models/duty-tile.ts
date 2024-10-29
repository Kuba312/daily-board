import { Option } from "@core/types/basics.types";
import { DutyDto } from "src/api/models";

export interface DutyTile {
	tile: DutyDto;
	height: Option<string>;
	top: Option<string>;
}