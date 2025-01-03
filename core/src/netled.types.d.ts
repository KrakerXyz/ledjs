import type { IArgb } from './IArgb';

export { }

declare global {

    namespace netled {

        namespace postProcessor {

            /** Wraps a IPostProcessor input and provides type constraints for error checking. */
            function definePostProcessor<TConfig extends common.IConfig = common.IConfig>(postProcessor: IPostProcessor<TConfig>): IPostProcessor<TConfig>;

            interface IPostProcessor<TConfig extends common.IConfig = common.IConfig> {
                /** Creates controller for the post processor */
                construct(ledSegment: common.ILedSegment, settings: common.ISettings<TConfig>): IPostProcessorController,
                /** Optional configuration metadata for the post processor */
                config?: TConfig,
            }

            interface IPostProcessorController<> {
                exec(): Promise<void>,
            }

        }

        namespace common {

            type IArgb = [number, number, number, number];

            /** Method for assigning color values to LEDs in an array */
            interface ILedSegment {
                /** The number of writeable leds in the array */
                readonly length: number,

                /** Array of leds positions that are considered dead and will be skipped when assigning or getting leds */
                readonly deadLeds: number[],

                /** Gets a copy of the segment without any possible dead leds. If there are no dead leds, the current instance is returned */
                readonly rawSegment: ILedSegment,

                /** Set LED at specified index using a four-element array representing [Alpha, Red, Green, Blue] bytes */
                setLed(index: number, argb: IArgb): void,
                /** Set LED at specified index to Alpha, Red, Green, Blue byte values */
                setLed(index: number, a: number, r: number, g: number, b: number): void,
                /** Set color component (0: Alpha, 1: Red, 2: Green, 3: Blue) of specified LED to given byte */
                setLed(index: number, component: 0 | 1 | 2 | 3, value: number | boolean): void,

                /** Gets current color values of LED at specified index returns as a four-element array of bytes representing [Alpha, Red, Green, Blue]  */
                getLed(index: number): IArgb,
                /** Gets byte of specified color component (0: Alpha, 1: Red, 2: Green, 3: Blue) of LED at given index */
                getLed(index: number, component: 0 | 1 | 2 | 3): number,

                /** Output the current array to the leds or the next stage in the pipeline */
                send(): Promise<void>,
            }

            interface IFieldSelectOption { text: string, value: string }

            interface IFieldSelect {
                type: 'select',
                options: [IFieldSelectOption, ...IFieldSelectOption[]],
                default: string,
            }

            type IConfigField = {
                name: string,
                description?: string,
            } & (
                {
                    type: 'int' | 'decimal',
                    minValue?: number,
                    maxValue?: number,
                    default: number,
                }
                | {
                    type: 'color',
                    default: `#${string}`,
                }
                | {
                    type: 'boolean',
                    default: boolean,
                }
                | IFieldSelect
            );

            type IConfig = Record<string, IConfigField>;

            type ISettingType<TField extends IConfigField> = TField['default']

            type ISettings<TConfig extends IConfig = Record<string, IConfigField>> = {
                [K in keyof TConfig]: ISettingType<TConfig[K]>
            }
        }

        namespace animation {

            /** Wraps a IAnimation input and provides type constraints for error checking. */
            function defineAnimation<TServices extends services.IAvailableServices = services.IAvailableServices, TConfig extends common.IConfig = common.IConfig>(animation: IAnimation<TServices, TConfig>): IAnimation<TServices, TConfig>;

            /** Returns from a IAnimation.construct method to provide animation control to the framework */
            interface IAnimationController<TConfig extends common.IConfig = common.IConfig> {
                run(settings: common.ISettings<TConfig>): void,
                pause(): void,
            }

            /** Represents a Animation script */
            interface IAnimation<TServices extends services.IAvailableServices = services.IAvailableServices, TConfig extends common.IConfig = common.IConfig> {
                services?: TServices,
                construct(ledSegment: common.ILedSegment, services: services.IServices<TServices>): IAnimationController<TConfig>,
                config?: TConfig,
            }

        }

        namespace services {

            type IAvailableServices = ('timer')[];

            interface ITimerInterval {
                start(): void,
                stop(): void,
            }

            interface ITimerOptions {
                started?: boolean,
            }

            /** Creates stable timeouts and intervals */
            interface ITimer {
                /** Create a stable interval that invokes a callback on a regular period */
                createInterval(interval: number, cb: () => void, options: ITimerOptions): ITimerInterval,
            }

            type IServices<T extends IAvailableServices = IAvailableServices> = {
                [s in Exclude<T[number], undefined>]: s extends 'timer' ? ITimer : never;
            }

        }

        namespace utils {

            namespace color {

                /** Converts HSL color values to IArgb */
                function hslToRgb(h: number, s: number, l: number): IArgb;
                /** Converts a hex value such as #ff7734eb to an IArgb array like [255, 119, 52, 235]. If given hex does not contain an Alpha (#7734eb), 255 is defaulted. If hex is malformed, [0, 0, 0, 0] is returned. */
                function hexToRgb(hex: string): IArgb;

            }

        }
    }
}