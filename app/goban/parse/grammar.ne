@preprocessor typescript

@{%
  import * as nodes from './nodes';
%}

Collection -> (_ GameTree):+ _
  {% nodes.Collection %}

GameTree -> "(" _ Sequence (_ GameTree):* _ ")"
  {% nodes.GameTree %}

Sequence -> (_ Node):+
  {% nodes.Sequence %}

Node -> ";" (_ Property):*
  {% nodes.Node %}

Property -> PropIdent (_ PropValue):+
  {% nodes.Property %}

PropIdent -> UcLetter:+
  {% nodes.PropIdent %}

PropValue -> "[" Text:? "]"
  {% nodes.PropValue %}

UcLetter -> [A-Z]
  {% id %}

Text -> ([^\]] | "\\]"):+
  {% nodes.Text %}

_ -> [ \t\n\r]:*