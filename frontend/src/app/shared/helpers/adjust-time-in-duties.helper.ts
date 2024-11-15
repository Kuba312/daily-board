import moment from "moment";
import { DutyDto } from "src/api/models";
import { TIME_FORMAT_WITH_SECONDS, TIME_FORMAT } from "../constants/shared-consts.const";

export function adjustTimeInDuties(plannersResponse: DutyDto[]): DutyDto[] {
	return plannersResponse.map((planner) => adjustTimeInDuty(planner));
}

function adjustTimeInDuty(dutyResponse: DutyDto): DutyDto {
	return {
		...dutyResponse,
		from: moment(dutyResponse.from, TIME_FORMAT_WITH_SECONDS).format(
			TIME_FORMAT,
		),
		to: moment(dutyResponse.to, TIME_FORMAT_WITH_SECONDS).format(
			TIME_FORMAT,
		),
	};
}
