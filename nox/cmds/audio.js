/* eslint-disable no-undef */
// @ts-nocheck
import { help } from '../lib/cmdsHelpers.js'

const { isTrueBoolean } = await import(/* webpackIgnore: true */'/scripts/utils.js');

const {
    SlashCommandParser, SlashCommand,
    SlashCommandNamedArgument, SlashCommandArgument,
    ARGUMENT_TYPE
} = SillyTavern.getContext();

/**
 * @typedef {import('/scripts/slash-commands/SlashCommand.js').UnnamedArguments} UnnamedArguments
 * @typedef {import('/scripts/slash-commands/SlashCommand.js').NamedArguments} NamedArguments
 */

/**
 * Plays an audio file
 *
 * @param {NamedArguments & {volume: string, await: string}} args
 * @param {UnnamedArguments} value
 */
async function audiosfx(args, value) {
    const response = await fetch(value, { headers: { responseType: 'arraybuffer' } });

    if (!response.ok) {
        throw new Error(`${response.status} - ${response.statusText}: /sfx ${value}`);
    }

    const con = new AudioContext();
    const src = con.createBufferSource();

    src.buffer = await con.decodeAudioData(await response.arrayBuffer());

    const volume = con.createGain();

    volume.gain.value = Number(args.volume ?? '1');
    volume.connect(con.destination);

    src.connect(volume);
    src.start();

    if (isTrueBoolean(args.await)) {
        await new Promise(resolve=>src.addEventListener('ended', resolve));
    }
}

/**
 * Initialize audio slash commands
 */
export async function initializeAudioCMDs() {
    SlashCommandParser.addCommandObject(SlashCommand.fromProps({
        name: 'sfx',
        callback: audiosfx,
        namedArgumentList: [
            SlashCommandNamedArgument.fromProps({
                name: 'volume',
                description: 'playback volume',
                typeList: [ARGUMENT_TYPE.NUMBER],
                defaultValue: '1.0',
            }),
            SlashCommandNamedArgument.fromProps({
                name: 'await',
                description: 'whether to wait for the sound to finish playing before continuing',
                typeList: [ARGUMENT_TYPE.BOOLEAN],
                defaultValue: 'false',
            }),
        ],
        unnamedArgumentList: [
            SlashCommandArgument.fromProps({
                description: 'url to audio file',
                typeList: [ARGUMENT_TYPE.STRING],
                isRequired: true,
            }),
        ],
        helpString: help(
            `Plays an audio file.`,
            [
                [
                    `/sfx volume=1.5 await=true /user/files/audio/mySound.wav | /echo finished playing sound`,
                    '',
                ],
            ],
        ),
    }));
}
