import { afterEach, beforeAll, describe, expect, test } from "vitest";
import { EmptyFileSystem, type LangiumDocument } from "langium";
import { expandToString as s } from "langium/generate";
import { clearDocuments, parseHelper } from "langium/test";
import type { <%= EntryName %> } from "<%= language-id %>-language";
import { create<%= LanguageName %>Services, is<%= EntryName %> } from "<%= language-id %>-language";

let services: ReturnType<typeof create<%= LanguageName %>Services>;
let parse:    ReturnType<typeof parseHelper<<%= EntryName %>>>;
let document: LangiumDocument<<%= EntryName %>> | undefined;

beforeAll(async () => {
    services = create<%= LanguageName %>Services(EmptyFileSystem);
    parse = parseHelper<<%= EntryName %>>(services.<%= LanguageName %>);

    // activate the following if your linking test requires elements from a built-in library, for example
    // await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
});

afterEach(async () => {
    document && clearDocuments(services.shared, [ document ]);
});

describe('Linking tests', () => {

    test('linking of greetings', async () => {
        document = await parse(`
            person Langium
            Hello Langium!
        `);

        expect(
            // here we first check for validity of the parsed document object by means of the reusable function
            //  'checkDocumentValid()' to sort out (critical) typos first,
            // and then evaluate the cross references we're interested in by checking
            //  the referenced AST element as well as for a potential error message;
            checkDocumentValid(document)
                || document.parseResult.value.greetings.map(g => g.person.ref?.name || g.person.error?.message).join('\n')
        ).toBe(s`
            Langium
        `);
    });
});

function checkDocumentValid(document: LangiumDocument): string | undefined {
    return document.parseResult.parserErrors.length && s`
        Parser errors:
          ${document.parseResult.parserErrors.map(e => e.message).join('\n  ')}
    `
        || document.parseResult.value === undefined && `ParseResult is 'undefined'.`
        || !is<%= EntryName %>(document.parseResult.value) && `Root AST object is a ${document.parseResult.value.$type}, expected a '<%= EntryName %>'.`
        || undefined;
}
