package com.nasyxrakeeb.m3ereference

import android.os.Bundle
import android.util.Log
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.size
import androidx.compose.material3.ExperimentalMaterial3ExpressiveApi
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.toPath
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.withFrameNanos
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.scale
import androidx.compose.ui.unit.dp
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.graphics.shapes.RoundedPolygon

private const val TAG = "M3E"

/**
 * Static 35-shape grid for the Day 7 raster diff against the React Native
 * `Shape` primitive.
 *
 * Layout contract (must match apps/gallery/src/shapes/ShapeDiffScreen.tsx):
 * 5 columns x 7 rows, 64dp shapes on a 72dp pitch, starting at (0, 0) on a
 * white background, system bars hidden.
 */
class ShapeGridActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val controller = WindowCompat.getInsetsController(window, window.decorView)
        controller.hide(WindowInsetsCompat.Type.systemBars())
        controller.systemBarsBehavior =
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE

        setContent {
            MaterialTheme {
                Box(Modifier.fillMaxSize().background(Color.White)) {
                    MATERIAL_SHAPE_NAMES.forEachIndexed { index, name ->
                        ShapeCell(
                            polygon = materialShape(name),
                            xDp = (index % 5) * 72,
                            yDp = (index / 5) * 72,
                        )
                    }
                }
                LaunchedEffect(Unit) {
                    withFrameNanos { }
                    withFrameNanos { }
                    Log.i(TAG, "M3E_SHAPES_READY")
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3ExpressiveApi::class)
@Composable
private fun ShapeCell(polygon: RoundedPolygon, xDp: Int, yDp: Int) {
    val path = polygon.toPath()
    Canvas(
        Modifier
            .offset(xDp.dp, yDp.dp)
            .size(64.dp),
    ) {
        scale(size.width, size.height, pivot = Offset.Zero) {
            drawPath(path, Color(0xFF6750A4))
        }
    }
}
