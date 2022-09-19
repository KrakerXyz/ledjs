import { ARGB } from '@krakerxyz/netled-core';

export {};

declare global {

    namespace netled {

        type IArgb = [number, number, number, number];

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
            getLed(index: number): IArgb;
            /** Gets byte of specified color component (0: Alpha, 1: Red, 2: Green, 3: Blue) of LED at given index */
            getLed(index: number, component: 0 | 1 | 2 | 3): number;

            /** Shift LEDs to the right */
            shift(dir?: 1 | true): void;
            /** shift LEDs to the left */
            shift(dir: 0 | false): void;

            /** Output the current array to the leds */
            send(): void;
        }

        type IFieldSelectOption = { text: string, value: string };

        type IFieldSelect = {
            type: 'select',
            options: [IFieldSelectOption, ...IFieldSelectOption[]],
            default: string
        };

        type IAnimationConfigField = {
            name: string,
            description?: string,

        } & (
            {
                type: 'int' | 'decimal',
                minValue?: number,
                maxValue?: number,
                default: number
            }
            | {
                type: 'color',
                default: `#${string}`
            }
            | IFieldSelect
        );

        type IAnimationConfig = Record<string, IAnimationConfigField>;

        type ISettingType<TField extends IAnimationConfigField> = TField['default']

        type IAnimationSettings<TConfig extends IAnimationConfig = Record<string, IAnimationConfigField>> = {
            [K in keyof TConfig]: ISettingType<TConfig[K]>
        }

        interface IAnimationController<TConfig extends IAnimationConfig = IAnimationConfig> {
            run(settings: IAnimationSettings<TConfig>): void;
            pause(): void;
        }

        interface IAnimation<TServices extends services.IAvailableServices = services.IAvailableServices, TConfig extends IAnimationConfig = IAnimationConfig> {
            services?: TServices;
            construct(ledArray: ILedArray, services: services.IServices<TServices>): IAnimationController<TConfig>,
            config?: TConfig;
        }

        namespace services {

            type IAvailableServices = ('timer')[];

            type ITimerInterval = {
                start(): void;
                stop(): void;
            }

            type ITimerOptions = {
                started?: boolean;
            }

            /** Creates stable timeouts and intervals */
            interface ITimer {
                /** Create a stable interval that invokes a callback on a regular period */
                createInterval(interval: number, cb: () => void, options: ITimerOptions): ITimerInterval;
            }

            type IServices<T extends IAvailableServices = IAvailableServices> = {
                [s in Exclude<T[number], undefined>]: s extends 'timer' ? ITimer : never;
            }

        }

        namespace utils {

            namespace color {

                /** Convers HSL color values to ARGB */
                function hslToRgb(h: number, s: number, l: number): ARGB;
                /** Converts a hex value such as #ff7734eb to an ARGB array like [255, 119, 52, 235]. If given hex does not contain an Alpha (#7734eb), 255 is defaulted. If hex is malformed, [0, 0, 0, 0] is returned. */
                function hexToRgb(hex: string): ARGB;

            }

        }
 
        declare function defineAnimation<TServices extends netled.services.IAvailableServices = netled.services.IAvailableServices, TConfig extends netled.IAnimationConfig = netled.IAnimationConfig>(animation: netled.IAnimation<TServices, TConfig>): netled.IAnimation<TServices, TConfig>;
    }
}