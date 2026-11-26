package com.nasyxrakeeb.m3ereference

import androidx.compose.material3.ExperimentalMaterial3ExpressiveApi
import androidx.compose.material3.MaterialShapes
import androidx.graphics.shapes.RoundedPolygon

/**
 * The 35 Material 3 Expressive shape names, in the canonical cycle order.
 *
 * Shared by the JVM golden test and the raster diff activity so both always
 * enumerate the same shapes.
 */
@OptIn(ExperimentalMaterial3ExpressiveApi::class)
val MATERIAL_SHAPE_NAMES: List<String> =
    listOf(
        "Arch",
        "Arrow",
        "Boom",
        "Bun",
        "Burst",
        "Circle",
        "ClamShell",
        "Clover4Leaf",
        "Clover8Leaf",
        "Cookie12Sided",
        "Cookie4Sided",
        "Cookie6Sided",
        "Cookie7Sided",
        "Cookie9Sided",
        "Diamond",
        "Fan",
        "Flower",
        "Gem",
        "Ghostish",
        "Heart",
        "Oval",
        "Pentagon",
        "Pill",
        "PixelCircle",
        "PixelTriangle",
        "Puffy",
        "PuffyDiamond",
        "SemiCircle",
        "Slanted",
        "SoftBoom",
        "SoftBurst",
        "Square",
        "Sunny",
        "Triangle",
        "VerySunny",
    )

/** Resolves a Material shape name to its `MaterialShapes` polygon. */
@OptIn(ExperimentalMaterial3ExpressiveApi::class)
fun materialShape(name: String): RoundedPolygon =
    when (name) {
        "Arch" -> MaterialShapes.Arch
        "Arrow" -> MaterialShapes.Arrow
        "Boom" -> MaterialShapes.Boom
        "Bun" -> MaterialShapes.Bun
        "Burst" -> MaterialShapes.Burst
        "Circle" -> MaterialShapes.Circle
        "ClamShell" -> MaterialShapes.ClamShell
        "Clover4Leaf" -> MaterialShapes.Clover4Leaf
        "Clover8Leaf" -> MaterialShapes.Clover8Leaf
        "Cookie12Sided" -> MaterialShapes.Cookie12Sided
        "Cookie4Sided" -> MaterialShapes.Cookie4Sided
        "Cookie6Sided" -> MaterialShapes.Cookie6Sided
        "Cookie7Sided" -> MaterialShapes.Cookie7Sided
        "Cookie9Sided" -> MaterialShapes.Cookie9Sided
        "Diamond" -> MaterialShapes.Diamond
        "Fan" -> MaterialShapes.Fan
        "Flower" -> MaterialShapes.Flower
        "Gem" -> MaterialShapes.Gem
        "Ghostish" -> MaterialShapes.Ghostish
        "Heart" -> MaterialShapes.Heart
        "Oval" -> MaterialShapes.Oval
        "Pentagon" -> MaterialShapes.Pentagon
        "Pill" -> MaterialShapes.Pill
        "PixelCircle" -> MaterialShapes.PixelCircle
        "PixelTriangle" -> MaterialShapes.PixelTriangle
        "Puffy" -> MaterialShapes.Puffy
        "PuffyDiamond" -> MaterialShapes.PuffyDiamond
        "SemiCircle" -> MaterialShapes.SemiCircle
        "Slanted" -> MaterialShapes.Slanted
        "SoftBoom" -> MaterialShapes.SoftBoom
        "SoftBurst" -> MaterialShapes.SoftBurst
        "Square" -> MaterialShapes.Square
        "Sunny" -> MaterialShapes.Sunny
        "Triangle" -> MaterialShapes.Triangle
        "VerySunny" -> MaterialShapes.VerySunny
        else -> error("Unknown shape $name")
    }
