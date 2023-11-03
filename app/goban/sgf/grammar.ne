@preprocessor typescript

@{%
  import * as nodes from './nodes';
  import { lexer } from './lexer';
%}

@lexer lexer

Collection -> (_ GameTree):+ _
  {% nodes.Collection %}

GameTree -> %lparen _ Sequence (_ GameTree):* _ %rparen
  {% nodes.GameTree %}

Sequence -> (_ Node):+
  {% nodes.Sequence %}

Node -> %semi (_ Property):*
  {% nodes.Node %}

Property -> %propIdent (_ %propValue):+
  {% nodes.Property %}

_ -> %ws:?