/* eslint-disable no-undef */
// @ts-nocheck
import { help } from '../lib/cmdsHelpers.js';

const {
    SlashCommandParser, SlashCommand,
    SlashCommandArgument, ARGUMENT_TYPE
} = SillyTavern.getContext();

const
    closure_arg = ARGUMENT_TYPE.CLOSURE;

/**
 * @typedef {import('/scripts/slash-commands/SlashCommandClosure.js').SlashCommandClosure} SlashCommandClosure
 *
 * @typedef {import('/scripts/slash-commands/SlashCommand.js').NamedArguments} NamedArguments
 * @typedef {import('/scripts/slash-commands/SlashCommand.js').UnnamedArguments} UnnamedArguments
 */


/**
 * Execute an asyncronous closure
 *
 * @param {NamedArguments} args
 * @param {UnnamedArguments} value
 */
async function fireAndForget(args, value){
    /**@type {SlashCommandClosure} */
    const closure = value;

    try {
        closure.scope.parent = args._scope;
        closure.execute();

    } catch {
        throw new TypeError('Type Error: Argument is not a closure.');
    }
}

/**
 * Initialize asyncronous slash commands
 */
export async function initializeAsyncCMDs(){
    SlashCommandParser.addCommandObject(SlashCommand.fromProps({
        name: 'fireandforget',
        callback: fireAndForget,
        unnamedArgumentList: [
            SlashCommandArgument.fromProps({
                description: 'the closure or command to execute',
                typeList: [
                    closure_arg,
                ],
                isRequired: true,
            }),
        ],
        splitUnnamedArgument: false,
        helpString: help(
            `Execute a closure or command without waiting for it to finish.`,
            [
                [
                    `
                        /fireandforget {:
                            /delay 1000 |
                            /echo firing |
                            /delay 1000 |
                            /echo fired script is done
                        :} |
                        /echo main script is done |
                    `,
                    'will show "main script is done", then "firing", then "fired script is done"',
                ],
            ],
        ),
    }));
}

