// @ts-nocheck
export function trim(txt){
    if (txt.split('\n').length < 2) return txt;
    const indent = /^([     ]*)\S/m.exec(txt)?.[1] ?? '';
    const re = new RegExp(`^${indent}`, 'mg');
    return txt.replace(re, '').replace(/\s*$/s, '');
}

function examples(list){
    const dom = document.createElement('div'); {
        const title = document.createElement('strong'); {
            title.textContent = 'Examples:';
            dom.append(title);
        }

        const ul = document.createElement('ul'); {
            for (const [code, comment] of list) {
                const li = document.createElement('li'); {
                    const pre = document.createElement('pre'); {
                        const c = document.createElement('code'); {
                            c.classList.add('language-stscript');
                            c.textContent = trim(code).trim();
                            pre.append(c);
                        }

                        li.append(pre);
                    }

                    const comm = document.createElement('span'); {
                        comm.innerHTML = comment;
                        li.append(comm);
                    }

                    ul.append(li);
                }
            }

            dom.append(ul);
        }
    }

    return dom.outerHTML;
}

export function help(text, ex){
    const converter = new showdown.Converter({
        emoji: true,
        literalMidWordUnderscores: true,
        parseImgDimensions: true,
        tables: true,
        underline: true,
        simpleLineBreaks: false,
        strikethrough: true,
        disableForced4SpacesIndentedSublists: true,
    });
    return [
        text ? converter.makeHtml(trim(text)) : '# HELP MISSING',
        ex ? examples(ex) : '# EXAMPLES MISSING',
    ].filter(it=>it).join('\n\n');
}
