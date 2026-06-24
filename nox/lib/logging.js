// @ts-nocheck
export function toConsole(level, value){
    try {
        const data = JSON.parse(value.toString());
        console[level](`[/console-${level}]`, data);

    } catch {
        console[level](`[/console-${level}]`, value);
    }

    return '';
}
