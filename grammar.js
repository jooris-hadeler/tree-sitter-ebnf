module.exports = grammar({
  name: "ebnf",

  // Extras are tokens that can appear anywhere (like whitespace and comments)
  extras: ($) => [/\s/, $.comment],

  rules: {
    // The entry point: a file is a repeating list of syntax rules
    source_file: ($) => repeat($.syntax_rule),

    // e.g., letter = "A" | "B" | "C" ;
    syntax_rule: ($) =>
      seq($.meta_identifier, "=", optional($.definitions_list), ";"),

    // e.g., "A" | "B" | "C"
    definitions_list: ($) =>
      seq($.single_definition, repeat(seq("|", $.single_definition))),

    // e.g., "A" , "B"
    single_definition: ($) =>
      seq($.syntactic_term, repeat(seq(",", $.syntactic_term))),

    // e.g., factor - exception
    syntactic_term: ($) =>
      seq($.syntactic_factor, optional(seq("-", $.syntactic_factor))),

    // e.g., 3 * "A"
    syntactic_factor: ($) =>
      seq(optional(seq($.integer, "*")), $.syntactic_primary),

    syntactic_primary: ($) =>
      choice(
        $.optional_sequence,
        $.repeated_sequence,
        $.grouped_sequence,
        $.meta_identifier,
        $.terminal_string,
        $.special_sequence,
        $.empty_sequence,
      ),

    // [ ... ] or (/ ... /)
    optional_sequence: ($) =>
      choice(
        seq("[", $.definitions_list, "]"),
        seq("(/", $.definitions_list, "/)"),
      ),

    // { ... } or (: ... :)
    repeated_sequence: ($) =>
      choice(
        seq("{", $.definitions_list, "}"),
        seq("(:", $.definitions_list, ":)"),
      ),

    // ( ... )
    grouped_sequence: ($) => seq("(", $.definitions_list, ")"),

    // ? ... ?
    special_sequence: ($) => seq("?", /[^?]*/, "?"),

    empty_sequence: ($) => "()",

    // Identifiers (e.g., rule_name)
    meta_identifier: ($) => /[a-zA-Z][a-zA-Z0-9_]*/,

    // Strings (e.g., "hello" or 'world')
    terminal_string: ($) =>
      choice(seq("'", /[^']*/, "'"), seq('"', /[^"]*/, '"')),

    // Numbers (used for repetition limits)
    integer: ($) => /[0-9]+/,

    // Comments (* ... *)
    comment: ($) => seq("(*", optional($._comment_content), "*)"),

    _comment_content: ($) =>
      choice(
        /[^*]+/, // Any characters except *
        /\*+[^)]/, // One or more * followed by anything EXCEPT )
      ),
  },
});
