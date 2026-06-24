// @ts-nocheck
import { help } from '../lib/cmdsHelpers.js';

const { SlashCommandParser, SlashCommand, SlashCommandArgument } = SillyTavern.getContext();

export async function initializeLoggingCMDs(){
    SlashCommandParser.addCommandObject(SlashCommand.fromProps({
        name: 'console-log',
        callback: (args, value)=>toConsole('log', value),
        unnamedArgumentList: [
            SlashCommandArgument.fromProps({
                description: 'the value to log',
                isRequired: true,
            }),
        ],
        helpString: help(
            `logs a value to the browser console`,
            [
                [
                    `/console-log Hello, World! |`,
                    '',
                ],
            ],
        ),
    }));

    SlashCommandParser.addCommandObject(SlashCommand.fromProps({
        name: 'console-warn',
        callback: (args, value)=>toConsole('warn', value),
        unnamedArgumentList: [
            SlashCommandArgument.fromProps({
                description: 'the value to log',
                isRequired: true,
            }),
        ],
        helpString: help(
            `logs a value to the browser console as a warning`,
            [
                [
                    `/console-warn This is a warning! |`,
                    '',
                ],
            ],
        ),
    }));

    SlashCommandParser.addCommandObject(SlashCommand.fromProps({
        name: 'console-error',
        callback: (args, value)=>toConsole('error', value),
        unnamedArgumentList: [
            SlashCommandArgument.fromProps({
                description: 'the value to log',
                isRequired: true,
            }),
        ],
        helpString: help(
            `logs a value to the browser console as an error`,
            [
                [
                    `/console-error OOPS! |`,
                    '',
                ],
            ],
        ),
    }));
}


