package com.nasyxrakeeb.m3ereference

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.graphics.Color as AndroidColor
import android.os.Bundle
import android.util.Log
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.RippleDefaults
import androidx.compose.material3.RippleThemeConfiguration
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.withFrameNanos
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.ExperimentalTextApi
import androidx.compose.ui.text.PlatformTextStyle
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontSynthesis
import androidx.compose.ui.text.font.FontVariation
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.text.style.LineHeightStyle
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextMotion
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.security.MessageDigest
import kotlin.math.ceil
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sqrt

private const val TAG = "M3E"
private const val ACTION_RERENDER = "com.nasyxrakeeb.m3ereference.RERENDER"
private const val FONT_ASSET = "fonts/RobotoFlex.ttf"
private const val SCENE_ASSET_DIR = ""

private enum class FontState { PENDING, OK, FALLBACK }

data class RectLayer(
    val x: Int,
    val y: Int,
    val width: Int,
    val height: Int,
    val radius: Float,
    val color: String,
    val elevationDp: Float,
)

data class TextLayer(
    val x: Int,
    val y: Int,
    val text: String,
    val sizeSp: Float,
    val weight: Int,
    val color: String,
    val letterSpacingSp: Float,
    val lineHeightSp: Float?,
    val widthDp: Int?,
)

data class FocusRingLayerSpec(
    val outerColor: String,
    val innerColor: String,
)

data class RippleLayerSpec(
    val progress: Float,
    val originX: Float,
    val originY: Float,
    val bounded: Boolean,
)

data class InteractionLayer(
    val x: Int,
    val y: Int,
    val width: Int,
    val height: Int,
    val radius: Float,
    val containerColor: String,
    val contentColor: String,
    val state: String,
    val elevationDp: Float,
    val surfaceTint: String,
    val focusRing: FocusRingLayerSpec?,
    val ripple: RippleLayerSpec?,
)

data class Scene(
    val id: String,
    val widthDp: Int,
    val heightDp: Int,
    val background: String,
    val rects: List<RectLayer>,
    val texts: List<TextLayer>,
    val interactions: List<InteractionLayer>,
)

private fun loadScene(context: Context, id: String): Scene {
    val asset = "$SCENE_ASSET_DIR$id.json"
    val text = context.assets.open(asset).bufferedReader().use { it.readText() }
    val json = JSONObject(text)
    check(json.getInt("schema") == 1) { "unsupported scene schema" }
    check(json.getString("id") == id) { "scene id does not match asset name" }
    val rects = mutableListOf<RectLayer>()
    val texts = mutableListOf<TextLayer>()
    val interactions = mutableListOf<InteractionLayer>()
    val layers = json.getJSONArray("layers")
    for (index in 0 until layers.length()) {
        val layer = layers.getJSONObject(index)
        when (layer.getString("type")) {
            "rect" -> rects += RectLayer(
                x = layer.getInt("x"),
                y = layer.getInt("y"),
                width = layer.getInt("width"),
                height = layer.getInt("height"),
                radius = layer.getDouble("radius").toFloat(),
                color = layer.getString("color"),
                elevationDp = layer.getDouble("elevationDp").toFloat(),
            )
            "text" -> texts += TextLayer(
                x = layer.getInt("x"),
                y = layer.getInt("y"),
                text = layer.getString("text"),
                sizeSp = layer.getDouble("sizeSp").toFloat(),
                weight = layer.getInt("weight"),
                color = layer.getString("color"),
                letterSpacingSp = layer.getDouble("letterSpacingSp").toFloat(),
                lineHeightSp =
                    if (layer.has("lineHeightSp")) layer.getDouble("lineHeightSp").toFloat()
                    else null,
                widthDp = if (layer.has("widthDp")) layer.getInt("widthDp") else null,
            )
            "interaction" -> {
                val focusRing = if (layer.isNull("focusRing")) {
                    null
                } else {
                    val ring = layer.getJSONObject("focusRing")
                    FocusRingLayerSpec(
                        outerColor = ring.getString("outerColor"),
                        innerColor = ring.getString("innerColor"),
                    )
                }
                val ripple = if (layer.isNull("ripple")) {
                    null
                } else {
                    val spec = layer.getJSONObject("ripple")
                    RippleLayerSpec(
                        progress = spec.getDouble("progress").toFloat(),
                        originX = spec.getDouble("originX").toFloat(),
                        originY = spec.getDouble("originY").toFloat(),
                        bounded = spec.getBoolean("bounded"),
                    )
                }
                interactions += InteractionLayer(
                    x = layer.getInt("x"),
                    y = layer.getInt("y"),
                    width = layer.getInt("width"),
                    height = layer.getInt("height"),
                    radius = layer.getDouble("radius").toFloat(),
                    containerColor = layer.getString("containerColor"),
                    contentColor = layer.getString("contentColor"),
                    state = layer.getString("state"),
                    elevationDp = layer.getDouble("elevationDp").toFloat(),
                    surfaceTint = layer.getString("surfaceTint"),
                    focusRing = focusRing,
                    ripple = ripple,
                )
            }
            else -> error("unsupported layer type ${layer.getString("type")}")
        }
    }
    return Scene(
        id = id,
        widthDp = json.getInt("widthDp"),
        heightDp = json.getInt("heightDp"),
        background = json.getString("background"),
        rects = rects,
        texts = texts,
        interactions = interactions,
    )
}

private fun parseColor(hex: String): Color = Color(AndroidColor.parseColor(hex))

private fun sha256(bytes: ByteArray): String =
    MessageDigest.getInstance("SHA-256").digest(bytes).joinToString("") { "%02x".format(it) }

class MainActivity : ComponentActivity() {
    private var sceneId by mutableStateOf("trivial")
    private var renderKey by mutableIntStateOf(0)
    private var fontState by mutableStateOf(FontState.PENDING)
    private var textMotion by mutableStateOf("static")
    private var textSizeMode by mutableStateOf("exact")
    private var textPosMode by mutableStateOf("exact")

    private val rerenderReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            val requested = intent?.getStringExtra("scene")
            if (!requested.isNullOrEmpty() && requested != sceneId) {
                sceneId = requested
            }
            renderKey += 1
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        sceneId = intent?.getStringExtra("scene") ?: "trivial"
        textMotion = intent?.getStringExtra("textMotion") ?: "static"
        textSizeMode = intent?.getStringExtra("textSizeMode") ?: "exact"
        Log.i(TAG, "M3E_TEXT_MOTION $textMotion")
        Log.i(TAG, "M3E_TEXT_SIZE_MODE $textSizeMode")
        textPosMode = intent?.getStringExtra("textPosMode") ?: "exact"
        Log.i(TAG, "M3E_TEXT_POS_MODE $textPosMode")
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val controller = WindowCompat.getInsetsController(window, window.decorView)
        controller.hide(WindowInsetsCompat.Type.systemBars())
        controller.systemBarsBehavior =
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE

        setContent {
            val context = LocalContext.current
            val fontFamily = remember(context) {
                FontFamily(
                    listOf(400, 500, 600, 700).map { weight ->
                        Font(
                            path = FONT_ASSET,
                            assetManager = context.assets,
                            weight = FontWeight(weight),
                            style = FontStyle.Normal,
                            variationSettings = FontVariation.Settings(
                                FontVariation.weight(weight),
                            ),
                        )
                    },
                )
            }
            val measurer = rememberTextMeasurer()

            LaunchedEffect(Unit) {
                val hash = withContext(Dispatchers.IO) {
                    sha256(context.assets.open(FONT_ASSET).use { it.readBytes() })
                }
                Log.i(TAG, "M3E_FONT_HASH $FONT_ASSET $hash")
                val probeFamily = { width: Float ->
                    FontFamily(
                        Font(
                            path = FONT_ASSET,
                            assetManager = context.assets,
                            weight = FontWeight.Normal,
                            style = FontStyle.Normal,
                            variationSettings = FontVariation.Settings(
                                FontVariation.weight(400),
                                FontVariation.width(width),
                            ),
                        ),
                    )
                }
                val narrow = measurer.measure(
                    text = "M3 Expressive",
                    style = TextStyle(
                        fontFamily = probeFamily(25f),
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Normal,
                        fontSynthesis = FontSynthesis.None,
                    ),
                ).size.width
                val wide = measurer.measure(
                    text = "M3 Expressive",
                    style = TextStyle(
                        fontFamily = probeFamily(100f),
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Normal,
                        fontSynthesis = FontSynthesis.None,
                    ),
                ).size.width
                val ok = narrow != wide
                Log.i(TAG, "M3E_FONT_PROBE wdth25=$narrow wdth100=$wide ok=$ok")
                fontState = if (ok) FontState.OK else FontState.FALLBACK
                if (!ok) {
                    Log.e(TAG, "M3E_FONT_FALLBACK $FONT_ASSET did not apply the wdth axis")
                }
            }

            MaterialTheme {
                Harness(sceneId, renderKey, fontFamily, fontState, textMotion, textSizeMode, textPosMode)
            }
        }

        ContextCompat.registerReceiver(
            this,
            rerenderReceiver,
            IntentFilter(ACTION_RERENDER),
            ContextCompat.RECEIVER_EXPORTED,
        )
    }

    override fun onDestroy() {
        unregisterReceiver(rerenderReceiver)
        super.onDestroy()
    }
}

@OptIn(ExperimentalTextApi::class)
@Composable
private fun Harness(
    sceneId: String,
    renderKey: Int,
    fontFamily: FontFamily,
    fontState: FontState,
    textMotion: String,
    textSizeMode: String,
    textPosMode: String,
) {
    val context = LocalContext.current
    val density = LocalDensity.current
    var ready by remember(sceneId, renderKey) { mutableStateOf(false) }
    val scene = remember(sceneId) {
        runCatching { loadScene(context, sceneId) }
            .onFailure { Log.e(TAG, "M3E_SCENE_ERROR scene=$sceneId", it) }
            .getOrNull()
    }

    LaunchedEffect(sceneId, renderKey) {
        if (scene == null) {
            return@LaunchedEffect
        }
        withFrameNanos { }
        withFrameNanos { }
        ready = true
        Log.i(TAG, "M3E_READY scene=$sceneId render=$renderKey")
    }

    Box(Modifier.fillMaxSize().background(Color.Black)) {
        if (scene != null) {
            Box(
                Modifier
                    .size(scene.widthDp.dp, scene.heightDp.dp)
                    .background(parseColor(scene.background)),
            ) {
                scene.rects.forEach { rect ->
                    val shape = RoundedCornerShape(rect.radius.dp)
                    val modifier = if (rect.elevationDp > 0f) {
                        Modifier
                            .offset(rect.x.dp, rect.y.dp)
                            .size(rect.width.dp, rect.height.dp)
                            .shadow(rect.elevationDp.dp, shape, clip = false)
                            .background(parseColor(rect.color), shape)
                    } else {
                        Modifier
                            .offset(rect.x.dp, rect.y.dp)
                            .size(rect.width.dp, rect.height.dp)
                            .background(parseColor(rect.color), shape)
                    }
                    Box(modifier)
                }
                scene.texts.forEach { text ->
                    val fontSize = if (textSizeMode == "ceil") {
                        val px = with(density) { text.sizeSp.sp.toPx() }
                        (ceil(px) / (density.density * density.fontScale)).sp
                    } else {
                        text.sizeSp.sp
                    }
                    val textOffset = if (textPosMode == "floor") {
                        Modifier.offset {
                            IntOffset(
                                (text.x * density.density).toInt(),
                                (text.y * density.density).toInt(),
                            )
                        }
                    } else {
                        Modifier.offset(text.x.dp, text.y.dp)
                    }
                    val multiline = text.widthDp != null || text.text.contains('\n')
                    val textModifier =
                        if (text.widthDp != null) textOffset.width(text.widthDp.dp) else textOffset
                    Text(
                        text = text.text,
                        modifier = textModifier,
                        color = parseColor(text.color),
                        fontSize = fontSize,
                        fontWeight = FontWeight(text.weight),
                        fontFamily = fontFamily,
                        letterSpacing = text.letterSpacingSp.sp,
                        lineHeight = text.lineHeightSp?.sp ?: TextUnit.Unspecified,
                        textAlign = TextAlign.Left,
                        maxLines = if (multiline) Int.MAX_VALUE else 1,
                        softWrap = multiline,
                        overflow = TextOverflow.Visible,
                        onTextLayout = { result ->
                            Log.i(
                                TAG,
                                "M3E_TEXT_LAYOUT text=${text.text.replace("\n", "\\n")} width=${result.size.width} height=${result.size.height} lines=${result.lineCount}",
                            )
                        },
                        style = TextStyle(
                            fontSynthesis = FontSynthesis.None,
                            platformStyle = PlatformTextStyle(includeFontPadding = false),
                            lineHeightStyle = LineHeightStyle(
                                LineHeightStyle.Alignment.Center,
                                LineHeightStyle.Trim.None,
                            ),
                            textMotion = when (textMotion) {
                                "animated" -> TextMotion.Animated
                                else -> TextMotion.Static
                            },
                        ),
                    )
                }
                scene.interactions.forEach { interaction ->
                    InteractionSample(interaction)
                }
            }
        } else {
            Box(Modifier.size(320.dp, 200.dp).background(Color(0xFFB00020)))
        }

        val bandColor = when {
            fontState == FontState.FALLBACK -> Color(0xFFFF8800)
            !ready -> Color(0xFFFF0000)
            else -> Color(0xFF00FF00)
        }
        Box(
            Modifier
                .offset(0.dp, 220.dp)
                .size(320.dp, 24.dp)
                .background(bandColor),
        )
    }
}

/**
 * Static interaction sample. The container and tonal/shadow elevation use the
 * real Compose `Surface`; the state layer, ripple frame and inset ring are
 * drawn with the same geometry the RN primitives implement so the pixel diff
 * checks both stacks against the same Compose tokens.
 */
@Suppress("DEPRECATION")
@Composable
private fun InteractionSample(layer: InteractionLayer) {
    val container = parseColor(layer.containerColor)
    val content = parseColor(layer.contentColor)
    val outerRing = layer.focusRing?.let { parseColor(it.outerColor) } ?: Color(0xFF625B71)
    val innerRing = layer.focusRing?.let { parseColor(it.innerColor) } ?: Color.White
    val scheme = lightColorScheme(
        surface = container,
        surfaceTint = parseColor(layer.surfaceTint),
        secondary = outerRing,
        onSecondary = innerRing,
    )
    MaterialTheme(colorScheme = scheme) {
        Surface(
            modifier = Modifier
                .offset(layer.x.dp, layer.y.dp)
                .size(layer.width.dp, layer.height.dp),
            shape = RoundedCornerShape(layer.radius.dp),
            color = container,
            contentColor = content,
            tonalElevation = layer.elevationDp.dp,
            shadowElevation = layer.elevationDp.dp,
        ) {
            Box(Modifier.fillMaxSize().clip(RoundedCornerShape(layer.radius.dp))) {
                val stateAlpha = when {
                    layer.focusRing != null || layer.ripple != null -> 0f
                    layer.state == "hover" -> RippleDefaults.RippleAlpha.hoveredAlpha
                    layer.state == "focus" -> RippleDefaults.RippleAlpha.focusedAlpha
                    layer.state == "pressed" -> RippleDefaults.RippleAlpha.pressedAlpha
                    layer.state == "dragged" -> RippleDefaults.RippleAlpha.draggedAlpha
                    else -> 0f
                }
                if (stateAlpha > 0f) {
                    Box(Modifier.fillMaxSize().background(content.copy(alpha = stateAlpha)))
                }
                layer.ripple?.let { RippleSample(layer, it, content) }
                layer.focusRing?.let { FocusRingSample(layer, it) }
            }
        }
    }
}

@Suppress("DEPRECATION")
@Composable
private fun RippleSample(layer: InteractionLayer, ripple: RippleLayerSpec, color: Color) {
    Canvas(Modifier.fillMaxSize()) {
        val width = size.width
        val height = size.height
        val startRadius = max(width, height) * 0.3f
        val endRadius = sqrt(width * width + height * height) / 2f +
            if (ripple.bounded) 10.dp.toPx() else 0f
        val progress = ripple.progress.coerceIn(0f, 1f)
        val radius = startRadius + (endRadius - startRadius) * FastOutSlowInEasing.transform(progress)
        val originX = ripple.originX.dp.toPx()
        val originY = ripple.originY.dp.toPx()
        val centerX = originX + (width / 2f - originX) * progress
        val centerY = originY + (height / 2f - originY) * progress
        val alpha = min(1f, progress * 225f / 75f) * RippleDefaults.RippleAlpha.pressedAlpha
        drawCircle(color = color.copy(alpha = alpha), radius = radius, center = Offset(centerX, centerY))
    }
}

@Composable
private fun FocusRingSample(layer: InteractionLayer, ring: FocusRingLayerSpec) {
    val insetRing =
        RippleDefaults.InsetFocusRingThemeConfiguration.focus as
            RippleThemeConfiguration.Focus.InsetRing
    Canvas(Modifier.fillMaxSize()) {
        val radiusPx = layer.radius.dp.toPx()
        fun drawStroke(insetDp: androidx.compose.ui.unit.Dp, widthDp: androidx.compose.ui.unit.Dp, color: Color) {
            val inset = insetDp.toPx()
            val width = widthDp.toPx()
            val half = width / 2f
            drawRoundRect(
                color = color,
                topLeft = Offset(half + inset, half + inset),
                size = Size(
                    size.width - width - inset * 2f,
                    size.height - width - inset * 2f,
                ),
                cornerRadius = CornerRadius((radiusPx - inset - half).coerceAtLeast(0f)),
                style = Stroke(width),
            )
        }
        drawStroke(insetRing.innerStrokeInset, insetRing.innerStrokeWidth, parseColor(ring.innerColor))
        drawStroke(insetRing.outerStrokeInset, insetRing.outerStrokeWidth, parseColor(ring.outerColor))
    }
}
