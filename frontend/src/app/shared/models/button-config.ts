export interface ButtonConfig {
	buttonLabel: string;
	emitOnClick?: boolean;
	secondary?: boolean;
	width?: number;
	disabled?: () => boolean;
	callback?: (...args: unknown[]) => void;
}