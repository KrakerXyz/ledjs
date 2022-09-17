
export {};

// declare global {

//     namespace netled {

//         /** Method for assigning color values to LEDs in an array */
//         interface ILedArray {
//         /** The number of LEDs in the array */
//             readonly length: number;

//             /** Set LED at specified index using a four-element array representing [Alpha, Red, Green, Blue] bytes */
//             setLed(index: number, argb: [number, number, number, number]): void;
//             /** Set LED at specified index to Alpha, Red, Green, Blue byte values */
//             setLed(index: number, a: number, r: number, g: number, b: number): void;
//             /** Set color component (0: Alpha, 1: Red, 2: Green, 3: Blue) of specified LED to given byte */
//             setLed(index: number, component: 0 | 1 | 2 | 3, value: number): void;

//             /** Gets current color values of LED at specified index returns as a four-element array of bytes representing [Alpha, Red, Green, Blue]  */
//             getLed(index: number): ARGB;
//             /** Gets byte of specified color component (0: Alpha, 1: Red, 2: Green, 3: Blue) of LED at given index */
//             getLed(index: number, component: 0 | 1 | 2 | 3): number;

//             /** Shift LEDs to the right */
//             shift(dir?: 1 | true): void;
//             /** shift LEDs to the left */
//             shift(dir: 0 | false): void;
        
//             /** Output the current array to the leds */
//             send(): void;
//         }

//         /** Animation script interface */
//         interface IAnimationScript {
//             /** Called after instantiation, on setting(s) change and after pauses to start the script */
//             run(settings: netled.IAnimationConfigValues<unknown>);
//             /** Called to temporarily pause the script with the expectation that a subsequent resume() will pick up where it left off */
//             pause(): void;
//         }

//         type IAnimationConfigField = {
//             name: string,
//             description?: string,

//         } & (
//             {
//                 type: 'int' | 'decimal',
//                 minValue?: number,
//                 maxValue?: number,
//                 default: number
//             }
//             | {
//                 type: 'select',
//                 options: { text: string, value: string}[],
//                 default: string
//             }
//         )

//         type IAnimationConfig = {
//             fields: Record<string, IAnimationConfigField>
//         }

//         type IAnimationConfigValues<TConfig extends IAnimationConfig = { fields: Record<string, IAnimationConfigField> }> = {
//             [K in keyof TConfig['fields']]:
//             //'int' | 'decimal' | 'select' extends TConfig['fields'][K]['type'] ? number | string :
//             'int' extends TConfig['fields'][K]['type'] ? number
//                 : 'decimal' extends TConfig['fields'][K]['type'] ? number 
//                     : 'string' extends TConfig['fields'][K]['type']  ? string 
//                         : never;
//         }

//         namespace services {

//             type TimerInterval = {
//                 start(): void;
//                 stop(): void;
//             }
//             type TimerOptions = {
//                 started?: boolean;
//             }

//             /** Creates stable timeouts and intervals */
//             interface ITimer {
//                 /** Create a stable interval that invokes a callback on a regular period */
//                 createInterval(interval: number, cb: () => void, options: TimerOptions): TimerInterval;
//             }

//         }

//         namespace utils {

//             namespace color {

//                 function hslToRgb(h: number, s: number, l: number): [number, number, number, number]

//             }

//         }

//     }
// }

declare global {

    namespace netled2 {

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
            | IFieldSelect
        );

        type IAnimationConfig = Record<string, IAnimationConfigField>;

        type ISettingType<TField extends IAnimationConfigField> =
            TField extends IFieldSelect ? TField['options'][number]['value']
                : 'int' extends TField['type'] ? number
                    : 'decimal' extends TField['type'] ? number
                        : unknown;

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

                function hslToRgb(h: number, s: number, l: number): [number, number, number, number]

            }

        }
 
        declare function defineAnimation<TServices extends netled2.services.IAvailableServices = netled2.services.IAvailableServices, TConfig extends netled2.IAnimationConfig = netled2.IAnimationConfig>(animation: netled2.IAnimation<TServices, TConfig>): netled2.IAnimation<TServices, TConfig>;
    }
}