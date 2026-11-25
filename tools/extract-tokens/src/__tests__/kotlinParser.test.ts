import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { bracketBalance, normalizeExpression, parseTokenSource } from '../kotlinParser.js';

const HEADER = `/*
 * Copyright 2021 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 */
// VERSION: v0_11_0
// GENERATED CODE - DO NOT MODIFY BY HAND

package androidx.compose.material3.tokens

`;

describe('parseTokenSource', () => {
  it('parses inline, getter, const, and multiline declarations', () => {
    const source = `${HEADER}internal object SampleTokens {
    const val DisabledContainerOpacity = 0.1f
    inline val ContainerColor: ColorToken
        get() = ColorSchemeKeyTokens.Primary
    val ContainerShape =
        RoundedCornerShape(
            topStart = 4.0.dp,
            topEnd = 4.0.dp,
            bottomEnd = 4.0.dp,
            bottomStart = 4.0.dp,
        )
    val Abstract: ColorToken
}
`;
    const file = parseTokenSource(source, 'commonMain/x/SampleTokens.kt');

    assert.equal(file.fileName, 'SampleTokens.kt');
    assert.equal(file.relativePath, 'commonMain/x/SampleTokens.kt');
    assert.equal(file.packageName, 'androidx.compose.material3.tokens');
    assert.equal(file.declarationName, 'SampleTokens');
    assert.equal(file.declarationKind, 'object');
    assert.equal(file.version, 'v0_11_0');
    assert.deepEqual(
      file.tokens.map((token) => [token.name, token.expression, token.line]),
      [
        ['DisabledContainerOpacity', '0.1f', 13],
        ['ContainerColor', 'ColorSchemeKeyTokens.Primary', 14],
        [
          'ContainerShape',
          'RoundedCornerShape( topStart = 4.0.dp, topEnd = 4.0.dp, bottomEnd = 4.0.dp, bottomStart = 4.0.dp, )',
          16,
        ],
      ],
    );
    assert.equal(file.tokens[0]?.isConst, true);
    assert.equal(file.tokens[1]?.isInline, true);
  });

  it('parses a class declaration used by TypographyTokens', () => {
    const source = `${HEADER}internal class TypographyTokens(val fontFamily: FontFamily? = null) {
    val BodyLarge: TextStyle
        get() = DefaultTextStyle.copy(fontSize = TypeScaleTokens.BodyLargeSize)
}
`;
    const file = parseTokenSource(source, 'commonMain/x/TypographyTokens.kt');
    assert.equal(file.declarationKind, 'class');
    assert.equal(file.declarationName, 'TypographyTokens');
    assert.equal(file.tokens.length, 1);
    assert.equal(
      file.tokens[0]?.expression,
      'DefaultTextStyle.copy(fontSize = TypeScaleTokens.BodyLargeSize)',
    );
  });

  it('rejects files without a package or declaration', () => {
    assert.throws(() => parseTokenSource('object X {}', 'x.kt'), /no package declaration/);
    assert.throws(
      () => parseTokenSource('package a.b\nval x = 1', 'x.kt'),
      /no object or class declaration/,
    );
  });
});

describe('bracketBalance', () => {
  it('counts nested brackets', () => {
    assert.equal(bracketBalance('RoundedCornerShape(4.0.dp)'), 0);
    assert.equal(bracketBalance('RoundedCornerShape('), 1);
    assert.equal(bracketBalance('a(b[c])'), 0);
    assert.equal(bracketBalance('a(b[c)'), 1);
  });
});

describe('normalizeExpression', () => {
  it('collapses whitespace', () => {
    assert.equal(normalizeExpression('  a(\n  b,\n  c ) '), 'a( b, c )');
  });
});
