
type ARGB = [number, number, number, number];

/** Method for assigning color values to LEDs in an array */
interface ILedArray {
    /** The number of LEDs in the array */
    readonly length: number;

    /** Set LED at specified index using a four-element array representing [Alpha, Red, Green, Blue] bytes */
    setLed(index: number, argb: [number, number, number, number]): void;
    /** Set LED at specified index to Alpha, Red, Green, Blue byte values */
    setLed(index: number, a: number, r: number, g: number, b: number): void;
    /** Set color component (0: Alpha, 1: Red, 2: Green, 3: Blue) of specified LED to given byte */
    setLed(index: number, component: 0 | 1 | 2 | 3, value: number): void;

    /** Gets current color values of LED at specified index returns as a four-element array of bytes representing [Alpha, Red, Green, Blue]  */
    getLed(index: number): ARGB;
    /** Gets byte of specified color component (0: Alpha, 1: Red, 2: Green, 3: Blue) of LED at given index */
    getLed(index: number, component: 0 | 1 | 2 | 3): number;

    /** Shift LEDs to the right */
    shift(dir?: 1 | true): void;
    /** shift LEDs to the left */
    shift(dir: 0 | false): void;
        
    /** Output the current array to the leds */
    send(): void;
}

type AvailableServices = ('timer' | 'webhook')[];

type TimerInterval = {
    start(): void;
    stop(): void;
}

type TimerOptions = {
    started?: boolean;
}

/** Creates stable timeouts and intervals */
interface ITimer {
    /** Create a stable interval that invokes a callback on a regular period */
    createInterval(interval: number, cb: () => void, options: TimerOptions): TimerInterval;
}

type Services<T extends AvailableServices> = {
    [s in Exclude<T[number], undefined>]: s extends 'timer' ? ITimer : never;
}

type FieldSelectOption = { text: string, value: string };

type FieldSelect = {
    type: 'select',
    options: [FieldSelectOption, ...FieldSelectOption[]],
    default: string
};

type AnimationConfigField = {
    name: string,
    description?: string,

} & (
    {
        type: 'int' | 'decimal',
        minValue?: number,
        maxValue?: number,
        default: number
    }
    | FieldSelect
);

type AnimationConfig = Record<string, AnimationConfigField>;

type SettingType<TField extends AnimationConfigField> =
    TField extends FieldSelect ? TField['options'][number]['value']
        : 'int' extends TField['type'] ? number
            : 'decimal' extends TField['type'] ? number
                : unknown;

type AnimationSettings<TConfig extends AnimationConfig = Record<string, AnimationConfigField>> = {
    [K in keyof TConfig]: SettingType<TConfig[K]>
    //'int' | 'decimal' | 'select' extends TConfig['fields'][K]['type'] ? number | string :
}

interface AnimationController<TConfig extends AnimationConfig> {
    run(settings: AnimationSettings<TConfig>): void;
    pause(): void;
}

interface IAnimation<TServices extends AvailableServices, TConfig extends AnimationConfig> {
    services: TServices;
    construct(ledArray: ILedArray, services: Services<TServices>): AnimationController<TConfig>,
    config?: TConfig;
}

export function defineAnimation<TServices extends AvailableServices, TConfig extends AnimationConfig>(animation: IAnimation<TServices, TConfig>): IAnimation<TServices, TConfig> {
    return animation;
}

export const t = defineAnimation({
    services: ['timer'],
    construct(ledArray, { timer }) {
        console.log({ ledArray, timer });
        return {
            run: (settings) => {
                console.log(settings.speed);
                console.log(settings.preset);
                console.log('Running');
            },
            pause() {
            }
        };
    },
    config: {
        speed: {
            type: 'int',
            name: 'Speed',
            default: 100
        },
        preset: {
            type: 'select',
            name: 'Test',
            options: [{ text: '', value: 'test' }],
            default: ''
        }
    }
});