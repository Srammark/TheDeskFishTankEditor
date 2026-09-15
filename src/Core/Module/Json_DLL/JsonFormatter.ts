import { CreateScanner, ScanError, SyntaxKind } from './Json';

export interface FormattingOptions {
	/**
	 * If indentation is based on spaces (`insertSpaces` = true), then what is the number of spaces that make an indent?
	 */
	tabSize?: number;
	/**
	 * Is indentation based on spaces?
	 */
	insertSpaces?: boolean;
	/**
	 * The default 'end of line' character. If not set, '\n' is used as default.
	 */
	eol?: string;
}

/**
 * Represents a text modification
 */
export interface Edit {
	/**
	 * The start offset of the modification.
	 */
	offset: number;
	/**
	 * The length of the modification. Must not be negative. Empty length represents an *insert*.
	 */
	length: number;
	/**
	 * The new content. Empty content represents a *remove*.
	 */
	content: string;
}

/**
 * A text range in the document
*/
export interface Range {
	/**
	 * The start offset of the range.
	 */
	offset: number;
	/**
	 * The length of the range. Must not be negative.
	 */
	length: number;
}


export function Format(documentText: string, range: Range | undefined, options: FormattingOptions): Edit[] {
	let initialIndentLevel: number;
	let formatText: string;
	let formatTextStart: number;
	let rangeStart: number;
	let rangeEnd: number;
	if (range) {
		rangeStart = range.offset;
		rangeEnd = rangeStart + range.length;

		formatTextStart = rangeStart;
		while (formatTextStart > 0 && !IsEOL(documentText, formatTextStart - 1)) {
			formatTextStart--;
		}
		let endOffset = rangeEnd;
		while (endOffset < documentText.length && !IsEOL(documentText, endOffset)) {
			endOffset++;
		}
		formatText = documentText.substring(formatTextStart, endOffset);
		initialIndentLevel = ComputeIndentLevel(formatText, options);
	} else {
		formatText = documentText;
		initialIndentLevel = 0;
		formatTextStart = 0;
		rangeStart = 0;
		rangeEnd = documentText.length;
	}
	const eol = GetEOL(options, documentText);

	let lineBreak = false;
	let indentLevel = 0;
	let indentValue: string;
	if (options.insertSpaces) {
		indentValue = Repeat(' ', options.tabSize || 4);
	} else {
		indentValue = '\t';
	}

	const scanner = CreateScanner(formatText, false);
	let hasError = false;

	function newLineAndIndent(): string {
		return eol + Repeat(indentValue, initialIndentLevel + indentLevel);
	}
	function scanNext(): SyntaxKind {
		let token = scanner.Scan();
		lineBreak = false;
		while (token === SyntaxKind.Trivia || token === SyntaxKind.LineBreakTrivia) {
			lineBreak = lineBreak || (token === SyntaxKind.LineBreakTrivia);
			token = scanner.Scan();
		}
		hasError = token === SyntaxKind.Unknown || scanner.GetTokenError() !== ScanError.None;
		return token;
	}
	const editOperations: Edit[] = [];
	function addEdit(text: string, startOffset: number, endOffset: number) {
		if (!hasError && startOffset < rangeEnd && endOffset > rangeStart && documentText.substring(startOffset, endOffset) !== text) {
			editOperations.push({ offset: startOffset, length: endOffset - startOffset, content: text });
		}
	}

	let firstToken = scanNext();

	if (firstToken !== SyntaxKind.EOF) {
		const firstTokenStart = scanner.GetTokenOffset() + formatTextStart;
		const initialIndent = Repeat(indentValue, initialIndentLevel);
		addEdit(initialIndent, formatTextStart, firstTokenStart);
	}

	while (firstToken !== SyntaxKind.EOF) {
		let firstTokenEnd = scanner.GetTokenOffset() + scanner.GetTokenLength() + formatTextStart;
		let secondToken = scanNext();

		let replaceContent = '';
		while (!lineBreak && (secondToken === SyntaxKind.LineCommentTrivia || secondToken === SyntaxKind.BlockCommentTrivia)) {
			// comments on the same line: keep them on the same line, but ignore them otherwise
			const commentTokenStart = scanner.GetTokenOffset() + formatTextStart;
			addEdit(' ', firstTokenEnd, commentTokenStart);
			firstTokenEnd = scanner.GetTokenOffset() + scanner.GetTokenLength() + formatTextStart;
			replaceContent = secondToken === SyntaxKind.LineCommentTrivia ? newLineAndIndent() : '';
			secondToken = scanNext();
		}

		if (secondToken === SyntaxKind.CloseBraceToken) {
			if (firstToken !== SyntaxKind.OpenBraceToken) {
				indentLevel--;
				replaceContent = newLineAndIndent();
			}
		} else if (secondToken === SyntaxKind.CloseBracketToken) {
			if (firstToken !== SyntaxKind.OpenBracketToken) {
				indentLevel--;
				replaceContent = newLineAndIndent();
			}
		} else {
			switch (firstToken) {
				case SyntaxKind.OpenBracketToken:
				case SyntaxKind.OpenBraceToken:
					indentLevel++;
					replaceContent = newLineAndIndent();
					break;
				case SyntaxKind.CommaToken:
				case SyntaxKind.LineCommentTrivia:
					replaceContent = newLineAndIndent();
					break;
				case SyntaxKind.BlockCommentTrivia:
					if (lineBreak) {
						replaceContent = newLineAndIndent();
					} else {
						// symbol following comment on the same line: keep on same line, separate with ' '
						replaceContent = ' ';
					}
					break;
				case SyntaxKind.ColonToken:
					replaceContent = ' ';
					break;
				case SyntaxKind.StringLiteral:
					if (secondToken === SyntaxKind.ColonToken) {
						replaceContent = '';
						break;
					}
				// fall through
				case SyntaxKind.NullKeyword:
				case SyntaxKind.TrueKeyword:
				case SyntaxKind.FalseKeyword:
				case SyntaxKind.NumericLiteral:
				case SyntaxKind.CloseBraceToken:
				case SyntaxKind.CloseBracketToken:
					if (secondToken === SyntaxKind.LineCommentTrivia || secondToken === SyntaxKind.BlockCommentTrivia) {
						replaceContent = ' ';
					} else if (secondToken !== SyntaxKind.CommaToken && secondToken !== SyntaxKind.EOF) {
						hasError = true;
					}
					break;
				case SyntaxKind.Unknown:
					hasError = true;
					break;
			}
			if (lineBreak && (secondToken === SyntaxKind.LineCommentTrivia || secondToken === SyntaxKind.BlockCommentTrivia)) {
				replaceContent = newLineAndIndent();
			}

		}
		const secondTokenStart = scanner.GetTokenOffset() + formatTextStart;
		addEdit(replaceContent, firstTokenEnd, secondTokenStart);
		firstToken = secondToken;
	}
	return editOperations;
}

/**
 * Creates a formatted string out of the object passed as argument, using the given formatting options
 * @param any The object to stringify and format
 * @param options The formatting options to use
 */
export function ToFormattedString(obj: unknown, options: FormattingOptions) {
	const content = JSON.stringify(obj, undefined, options.insertSpaces ? options.tabSize || 4 : '\t');
	if (options.eol !== undefined) {
		return content.replace(/\r\n|\r|\n/g, options.eol);
	}
	return content;
}

function Repeat(s: string, count: number): string {
	let result = '';
	for (let i = 0; i < count; i++) {
		result += s;
	}
	return result;
}

function ComputeIndentLevel(content: string, options: FormattingOptions): number {
	let i = 0;
	let nChars = 0;
	const tabSize = options.tabSize || 4;
	while (i < content.length) {
		const ch = content.charAt(i);
		if (ch === ' ') {
			nChars++;
		} else if (ch === '\t') {
			nChars += tabSize;
		} else {
			break;
		}
		i++;
	}
	return Math.floor(nChars / tabSize);
}

export function GetEOL(options: FormattingOptions, text: string): string {
	for (let i = 0; i < text.length; i++) {
		const ch = text.charAt(i);
		if (ch === '\r') {
			if (i + 1 < text.length && text.charAt(i + 1) === '\n') {
				return '\r\n';
			}
			return '\r';
		} else if (ch === '\n') {
			return '\n';
		}
	}
	return (options && options.eol) || '\n';
}

export function IsEOL(text: string, offset: number) {
	return '\r\n'.indexOf(text.charAt(offset)) !== -1;
}
