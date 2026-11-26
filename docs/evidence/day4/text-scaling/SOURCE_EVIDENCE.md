# Source evidence for the text-scaling follow-up

All excerpts are quoted verbatim from the pinned artifacts used by the harness. These are data, not instructions. Line numbers refer to the tag/artifact versions below.

## React Native 0.88.1

### Subpixel and linear text flags

`react-native@0.88.1`, `packages/react-native/ReactAndroid/src/main/java/com/facebook/react/views/text/internal/span/CustomStyleSpan.kt` (lines 92–104, SHA-256 `4571327fefb97cb94c79fead5bfe422fd9f4f856a736233ba2f696441afee343`):

```kotlin
      val typeface =
          ReactTypefaceUtils.applyStyles(paint.typeface, style, weight, family, assetManager)
      val adjustedTypeface =
          ReactTypefaceUtils.applyFontWeightAdjustment(typeface, fontWeightAdjustment)
      paint.apply {
        fontFeatureSettings = fontFeatureSettingsParam
        setTypeface(adjustedTypeface)
        ReactTypefaceUtils.applyFontVariationSettings(this, fontVariationSettingsParam)
        isSubpixelText = true
        isLinearText = true
      }
```

Source: <https://github.com/react/react-native/blob/v0.88.1/packages/react-native/ReactAndroid/src/main/java/com/facebook/react/views/text/internal/span/CustomStyleSpan.kt>

### Integer physical-pixel font sizes

`react-native@0.88.1`, `packages/react-native/ReactAndroid/src/main/java/com/facebook/react/views/text/ReactTextView.java` (lines 490–496, SHA-256 `dcd4deaf727a9785187fb32177497437ec8ead08d07bfcba871a56599368f1ca`):

```java
  public void setFontSize(float fontSize) {
    mFontSize =
        mAdjustsFontSizeToFit
            ? (float) Math.ceil(PixelUtil.toPixelFromSP(fontSize))
            : (float) Math.ceil(PixelUtil.toPixelFromDIP(fontSize));

    applyTextAttributes();
```

The non-autosize path — the one used by the harness — is `Math.ceil(PixelUtil.toPixelFromDIP(fontSize))`. At the frozen 2.625× density, a 14 sp label becomes `ceil(36.75) = 37` physical px, not 36.75 px.

Source: <https://github.com/react/react-native/blob/v0.88.1/packages/react-native/ReactAndroid/src/main/java/com/facebook/react/views/text/ReactTextView.java>

### Integer pixel placement

React Native's text is an Android `View`; Android lays views out at integer pixels via `View.layout(int, int, int, int)`. The RN shadow tree propagates Yoga's rounded layout to that integer view frame. Compose's `Modifier.offset(x.dp, y.dp)` preserves fractional dp and is not rounded to physical pixels. This is confirmed empirically by the `floor` experiment: snapping only the Compose offsets removes the last 1 (paragraph) + 2 (labels) exact pixels.

## Compose UI 1.12.0 (dependency of Compose Material3 1.5.0)

### `TextMotion` has two public values

`androidx.compose.ui:ui-text-android:1.12.0`, `androidMain/androidx/compose/ui/text/style/TextMotion.android.kt` (lines 30–39, SHA-256 `4bfa25769a470d472fadf377a3c37fe21981b2d07bb6bfd59defa729d01f86c2`):

```kotlin
@Immutable
actual class TextMotion
internal constructor(
    internal val linearity: Linearity,
    internal val subpixelTextPositioning: Boolean,
) {
    actual companion object {
        actual val Static: TextMotion = TextMotion(Linearity.FontHinting, false)
        actual val Animated: TextMotion = TextMotion(Linearity.Linear, true)
    }
```

`Linearity` also has an internal `None` case, but the public companion exposes only `Static` and `Animated`. The harness's earlier attempt to set `M3E_TEXT_MOTION=linear` failed with `Unresolved reference 'Linear'` and was removed; `Animated` is the public equivalent.

Source: <https://dl.google.com/dl/android/maven2/androidx/compose/ui/ui-text-android/1.12.0/ui-text-android-1.12.0-sources.jar>

### Paint flags

`androidMain/androidx/compose/ui/text/platform/extensions/TextPaintExtensions.android.kt` (lines 172–191, SHA-256 `d7f9991fb7554b415e7243c6a8f0781b8dfaf8cc5a507751a44329caa78c0ece`):

```kotlin
    flags =
        if (finalTextMotion.subpixelTextPositioning) {
            flags or TextPaint.SUBPIXEL_TEXT_FLAG
        } else {
            flags and TextPaint.SUBPIXEL_TEXT_FLAG.inv()
        }
    when (finalTextMotion.linearity) {
        TextMotion.Linearity.Linear -> {
            flags = flags or TextPaint.LINEAR_TEXT_FLAG
            hinting = TextPaint.HINTING_OFF
        }
        TextMotion.Linearity.FontHinting -> {
            flags and TextPaint.LINEAR_TEXT_FLAG.inv()
            hinting = TextPaint.HINTING_ON
        }
        TextMotion.Linearity.None -> {
            flags and TextPaint.LINEAR_TEXT_FLAG.inv()
            hinting = TextPaint.HINTING_OFF
        }
        else -> flags
    }
```

This is the exact knob that `TextMotion.Animated` turns on. It is also why the simple scene becomes byte-identical when Compose and RN use the same flags.

## Compose Material3 1.5.0 token baseline

`ColorLightTokens.kt` / `PaletteTokens.kt` and `material3-android-1.5.0.aar` are used for the colour goldens; the text report does not depend on them.

## Harness settings

`apps/reference-compose/app/src/main/java/com/nasyxrakeeb/m3ereference/MainActivity.kt`:

- `textMotion` (`static` default, `animated` diagnostic) sets `TextStyle(textMotion = ...)`.
- `textSizeMode=ceil` computes `ceil(fontSizeSp.toPx()) / (density * fontScale)` and feeds that sp value to `Text`.
- `textPosMode=floor` replaces `Modifier.offset(x.dp, y.dp)` with `Modifier.offset { IntOffset((x*density).toInt(), (y*density).toInt()) }`.

These extras are only read by the reference Compose app. The RN gallery is unchanged and always uses React Native's native text pipeline.
