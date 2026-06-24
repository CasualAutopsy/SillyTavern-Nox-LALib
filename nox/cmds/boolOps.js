/* eslint-disable no-undef */
// @ts-nocheck
const { BoolParser } = await import(/* webpackIgnore: true */'../../src/BoolParser.js');

const { isTrueBoolean } = await import(/* webpackIgnore: true */'/scripts/utils.js');
const { evalBoolean, parseBooleanOperands } = await import(/* webpackIgnore: true */'/scripts/variables.js');

const {
    SlashCommandParser, SlashCommand,
    SlashCommandNamedArgument, SlashCommandArgument, ARGUMENT_TYPE,
    SlashCommandEnumValue
} = SillyTavern.getContext();

/**
 * @typedef {import('/scripts/slash-commands/SlashCommand.js').UnnamedArguments} UnnamedArguments
 * @typedef {import('/scripts/slash-commands/SlashCommand.js').NamedArguments} NamedArguments
 */

function makeBoolEnumProvider() {
    return (executor, scope)=>[
        new SlashCommandEnumValue('bool', 'true  |  false', enumTypes.enum, enumIcons.boolean, (input)=>true, (input)=>input),
        new SlashCommandEnumValue('string', '\'...\' ← single quotes!', enumTypes.enum, enumIcons.boolean, (input)=>true, (input)=>input),
        new SlashCommandEnumValue('number', '1.23', enumTypes.enum, enumIcons.boolean, (input)=>true, (input)=>input),
        new SlashCommandEnumValue('variable', 'a  |  a.property  |  a*.property', enumTypes.enum, enumIcons.boolean, (input)=>true, (input)=>input),
        new SlashCommandEnumValue('macro', '{...} ← single curlies!', enumTypes.enum, enumIcons.boolean, (input)=>true, (input)=>input),
        new SlashCommandEnumValue('negation', '!a', enumTypes.enum, enumIcons.boolean, (input)=>true, (input)=>input),
        new SlashCommandEnumValue('logical operator', 'a and b  |  a xor b  |  a or b', enumTypes.enum, enumIcons.boolean, (input)=>true, (input)=>input),
        new SlashCommandEnumValue('sub-expression', '(...)', enumTypes.enum, enumIcons.boolean, (input)=>true, (input)=>input),
        new SlashCommandEnumValue('comparison operator', 'a == b  |  a === b  |  a != b  |  a !== b  |  a &gt; b  |  a &gt;= b  |  a &lt; b  |  a &lt;= b  |  a in b  |  a not in b  | a <=> b', enumTypes.enum, enumIcons.boolean, (input)=>true, (input)=>input),
        new SlashCommandEnumValue('type check', 'a is string  |  a is number  |  a is boolean  |  a is list  |  a is dictionary  |  a is closure', enumTypes.enum, enumIcons.boolean, (input)=>true, (input)=>input),
        new SlashCommandEnumValue('regex', '/pattern/flags ← escape pipes! \\|', enumTypes.enum, enumIcons.boolean, (input)=>true, (input)=>input),
        new SlashCommandEnumValue('arithmetic operator', 'a + b  |  a - b  |  a * b  |  a / b  |  a // b  |  a % b  |  a ** b', enumTypes.enum, enumIcons.boolean, (input)=>true, (input)=>input),
        new SlashCommandEnumValue('assignment', 'only at start:  a = b  |  a += b  |  a -= b  |  a *= b  |  a /= b  |  a //= b  |  a %= b  |  a **= b', enumTypes.enum, enumIcons.boolean, (input)=>true, (input)=>input),
        new SlashCommandEnumValue('pre / post increment / decrement', '++a  |  a++  |  --a  |  a--', enumTypes.enum, enumIcons.boolean, (input)=>true, (input)=>input),
    ];
}

/**
 * Evaluates a boolean or arithmetic expression
 *
 * @param {NamedArguments} args - Named arguments
 * @param {UnnamedArguments} value - Unnamed arguments
 *
 * @returns {string}
 */
async function booleanExpression(args, value) {
    const parser = new BoolParser(args._scope, args);
    const result = parser.parse(value);
    const resultValue = result();

    if (typeof resultValue == 'string') return resultValue;
    if (resultValue === undefined || resultValue === null) return '';

    return JSON.stringify(resultValue);
}

/**
 * Compare two values and return the result of the comparison
 *
 * @param {NamedArguments & {
 *  left: string,
 *  rule: string,
 *  right: string
 * }} args - Named arguments
 * @param {UnnamedArguments} _
 *
 * @returns {string}
 */
async function booleanTest(args, _) {
    const { a, b, rule } = parseBooleanOperands(args);

    return JSON.stringify(evalBoolean(rule, a, b));
}

/**
 * Returns true if all values are true, otherwise false.
 *
 * @param {NamedArguments} _
 * @param {UnnamedArguments} value - Unnamed arguments
 *
 * @returns {string}
 */
async function booleanAnd(_, value) {
    for (let val of value) {
        let check;
        try {
            check = isTrueBoolean(val);
        } catch { /*empty*/ }

        if (!(check ?? val)) return JSON.stringify(false);
    }

    return JSON.stringify(true);
}

/**
 * Returns true if at least one of the values is true, false if all are false.
 *
 * @param {NamedArguments} _
 * @param {UnnamedArguments} value - Unnamed arguments
 *
 * @returns {string}
 */
async function booleanOr(_, value) {
    for (let val of value) {
        let check;
        try {
            check = isTrueBoolean(val);
        } catch { /*empty*/ }

        if ((check ?? val)) return JSON.stringify(true);
    }

    return JSON.stringify(false);
}

/**
 * Returns true if value is false, otherwise false.
 *
 * @param {NamedArguments} _
 * @param {UnnamedArguments} value - Unnamed arguments
 * @returns
 */
async function booleanNot(_, value) {
    return JSON.stringify(isTrueBoolean(value) !== true);
}

/**
 * Initialize boolean operations slash commands
 */
export async function initializeBoolOpsCMDs() {
    SlashCommandParser.addCommandObject(SlashCommand.fromProps({
        name: '=',
        callback: booleanExpression,
        namedArgumentList: [
            SlashCommandNamedArgument.fromProps({
                name: 'expression variables',
                description: 'named arguments assigned to scoped variables to be used in the expression',
                acceptsMultiple: true,
                typeList: [
                    ARGUMENT_TYPE.BOOLEAN,
                    ARGUMENT_TYPE.CLOSURE,
                    ARGUMENT_TYPE.DICTIONARY,
                    ARGUMENT_TYPE.LIST,
                    ARGUMENT_TYPE.NUMBER,
                    ARGUMENT_TYPE.STRING
                ],
            }),
        ],
        unnamedArgumentList: [
            SlashCommandArgument.fromProps({
                description: 'boolean / arithmetic expression',
                enumProvider: makeBoolEnumProvider,
                isRequired: true,
                acceptsMultiple: true,
            }),
        ],
        // splitUnnamedArgument: true,
        returns: 'result of the expression',
        helpString: help(
            `
                Evaluates a boolean or arithmetic expression

                See <a data-lalib-exec="/lalib? expressions"><code>/lalib? expressions</code></a> for more details
                on expressions.
            `,
            [
                ['/= true or false', ''],
                ['/= 1 < 2 and (\'a\' in x or \'b\' not in y) and !z', ''],
                ['/= 1 + 2 * 3 ** 4', ''],
                ['/= (1 + 2) * 3 ** 4', ''],
                [
                    `
                        /genraw say either foo or bar |
                        /= result={{pipe}} ('foo' in result) |
                    `,
                    'use named arguments to provide variables to the expression',
                ],
            ],
        ),
    }));


    SlashCommandParser.addCommandObject(SlashCommand.fromProps({
        name: 'test',
        callback: booleanTest,
        namedArgumentList: [
            SlashCommandNamedArgument.fromProps({
                name: 'left',
                description: 'the left operand value',
                typeList: [
                    ARGUMENT_TYPE.VARIABLE_NAME,
                    ARGUMENT_TYPE.NUMBER,
                    ARGUMENT_TYPE.STRING
                ],
                isRequired: true,
            }),
            SlashCommandNamedArgument.fromProps({
                name: 'rule',
                description: 'the boolean operation rule',
                typeList: [
                    ARGUMENT_TYPE.STRING
                ],
                isRequired: true,
                enumList: [
                    new SlashCommandEnumValue('gt',  'a > b'),
                    new SlashCommandEnumValue('gte', 'a >= b'),
                    new SlashCommandEnumValue('lt',  'a < b'),
                    new SlashCommandEnumValue('lte', 'a <= b'),
                    new SlashCommandEnumValue('eq',  'a == b'),
                    new SlashCommandEnumValue('neq', 'a !== b'),
                    new SlashCommandEnumValue('not', '!a'),
                    new SlashCommandEnumValue('in',  'a includes b'),
                    new SlashCommandEnumValue('nin', 'a not includes b'),
                ],
            }),
            SlashCommandNamedArgument.fromProps({ name: 'right',
                description: 'the right operand value',
                typeList: [
                    ARGUMENT_TYPE.VARIABLE_NAME,
                    ARGUMENT_TYPE.NUMBER,
                    ARGUMENT_TYPE.STRING
                ],
                isRequired: true,
            }),
        ],
        helpString: help(
            `
                Compares the value of the left operand <code>a</code> with the value of the right operand <code>b</code>,
                and returns the result of the comparison (true or false).

                Numeric values and string literals for left and right operands supported.

                <strong>Available rules:</strong>
                <ul>
                    <li>gt =&gt; a &gt; b</li>
                    <li>gte =&gt; a &gt;= b</li>
                    <li>lt =&gt; a &lt; b</li>
                    <li>lte =&gt; a &lt;= b</li>
                    <li>eq =&gt; a == b</li>
                    <li>neq =&gt; a != b</li>
                    <li>not =&gt; !a</li>
                    <li>in (strings) =&gt; a includes b</li>
                    <li>nin (strings) =&gt; a not includes b</li>
                </ul>
            `,
            [
                [
                    `/setvar key=i 0 | /test left=i rule=lte right=10 | /echo`,
                    'returns <code>true</code>',
                ],
            ],
        ),
        returns: 'true or false',
    }));


    SlashCommandParser.addCommandObject(SlashCommand.fromProps({
        name: 'and',
        callback: booleanAnd,
        unnamedArgumentList: [
            SlashCommandArgument.fromProps({
                description: 'the values to evaluate',
                typeList: [
                    ARGUMENT_TYPE.BOOLEAN
                ],
                acceptsMultiple: true,
                isRequired: true,
            }),
        ],
        splitUnnamedArgument: true,
        returns: 'true or false',
        helpString: help(
            `Returns true if all values are true, otherwise false.`,
            [
                [
                    `/and true true true`,
                    'Returns true.',
                ],
                [
                    `/and true false true`,
                    'Returns false.',
                ],
            ],
        ),
    }));


    SlashCommandParser.addCommandObject(SlashCommand.fromProps({
        name: 'or',
        callback: booleanOr,
        unnamedArgumentList: [
            SlashCommandArgument.fromProps({ description: 'the values to evaluate',
                typeList: [
                    ARGUMENT_TYPE.BOOLEAN
                ],
                acceptsMultiple: true,
                isRequired: true,
            }),
        ],
        splitUnnamedArgument: true,
        returns: 'true or false',
        helpString: help(
            `Returns true if at least one of the values is true, false if all are false.`,
            [
                [
                    `/or true true true`,
                    'Returns true.',
                ],
                [
                    `/or true false true`,
                    'Returns true.',
                ],
                [
                    `/or false false false`,
                    'Returns false.',
                ],
            ],
        ),
    }));


    SlashCommandParser.addCommandObject(SlashCommand.fromProps({
        name: 'not',
        callback: booleanNot,
        unnamedArgumentList: [
            SlashCommandArgument.fromProps({
                description: 'the value to negate',
                typeList: [
                    ARGUMENT_TYPE.BOOLEAN
                ],
                isRequired: true,
            }),
        ],
        helpString: help(
            `Returns true if value is false, otherwise true.`,
            [
                [
                    `/not false`,
                    'Returns true.',
                ],
                [
                    `/not true`,
                    'Returns false.',
                ],
            ],
        ),
        returns: 'true or false',
    }));
}














