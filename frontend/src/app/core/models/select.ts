import { Primitive } from '../types/basics.types';

export interface SelectPair<T extends Primitive, U extends Primitive> {
	label: T;
	value: U;
}
