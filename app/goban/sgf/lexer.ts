import moo from "moo";

export const lexer = moo.compile({
  ws: { match: /[ \t\n\r]+/, lineBreaks: true },
  lparen: "(",
  rparen: ")",
  semi: ";",
  // Matches [something] with support for escaped closing brackets
  propValue: /\[(?:[^\]]|(?<=\\)\])*\]/,
  propIdent: /[A-Z]+/,
});
