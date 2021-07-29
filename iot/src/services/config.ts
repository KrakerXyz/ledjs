
import { constants } from 'fs';
import { writeFile, readFile, access } from 'fs/promises';
import { createInterface } from 'readline';

export async function initConfig(): Promise<Config> {

    await new Promise<void>(fileExists => {

        access('config.json', constants.F_OK).then(fileExists).catch(async () => {

            const rl = createInterface(process.stdin, process.stdout);
            const { id, secret } = await new Promise<{ id: string, secret: string }>(r => {
                rl.question('Device ID: ', id => {
                    rl.question('Secret: ', secret => {
                        r({ id, secret });
                    });
                });
            });

            const newConfig: Config = { version: 1, id, secret };

            await writeFile('config.json', JSON.stringify(newConfig, null, 3));

            fileExists();

        });

    });

    const configJson = await readFile('config.json', 'utf8');
    const config = JSON.parse(configJson);

    return config;

}

export interface Config {
    version: 1;
    id: string;
    secret: string;
    host?: string;
}