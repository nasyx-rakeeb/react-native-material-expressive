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
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.withFrameNanos
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
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
)

data class Scene(
    val id: String,
    val widthDp: Int,
    val heightDp: Int,
    val background: String,
    val rects: List<RectLayer>,
    val texts: List<TextLayer>,
)

private fun loadScene(context: Context, id: String): Scene {
    val asset = "$SCENE_ASSET_DIR$id.json"
    val text = context.assets.open(asset).bufferedReader().use { it.readText() }
    val json = JSONObject(text)
    check(json.getInt("schema") == 1) { "unsupported scene schema" }
    check(json.getString("id") == id) { "scene id does not match asset name" }
    val rects = mutableListOf<RectLayer>()
    val texts = mutableListOf<TextLayer>()
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
            )
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
    )
}

private fun parseColor(hex: String): Color = Color(AndroidColor.parseColor(hex))

private fun sha256(bytes: ByteArray): String =
    MessageDigest.getInstance("SHA-256").digest(bytes).joinToString("") { "%02x".format(it) }

class MainActivity : ComponentActivity() {
    private var sceneId by mutableStateOf("trivial")
    private var renderKey by mutableIntStateOf(0)
    private var fontState by mutableStateOf(FontState.PENDING)

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
                    Font(
                        path = FONT_ASSET,
                        assetManager = context.assets,
                        weight = FontWeight.Normal,
                        style = FontStyle.Normal,
                        variationSettings = FontVariation.Settings(FontVariation.weight(400)),
                    ),
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
                Harness(sceneId, renderKey, fontFamily, fontState)
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
) {
    val context = LocalContext.current
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
                    Text(
                        text = text.text,
                        modifier = Modifier.offset(text.x.dp, text.y.dp),
                        color = parseColor(text.color),
                        fontSize = text.sizeSp.sp,
                        fontWeight = FontWeight(text.weight),
                        fontFamily = fontFamily,
                        letterSpacing = text.letterSpacingSp.sp,
                        textAlign = TextAlign.Left,
                        maxLines = 1,
                        softWrap = false,
                        overflow = TextOverflow.Visible,
                        onTextLayout = { result ->
                            Log.i(
                                TAG,
                                "M3E_TEXT_LAYOUT text=${text.text} width=${result.size.width} height=${result.size.height} lines=${result.lineCount}",
                            )
                        },
                        style = TextStyle(
                            fontSynthesis = FontSynthesis.None,
                            platformStyle = PlatformTextStyle(includeFontPadding = false),
                        ),
                    )
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
